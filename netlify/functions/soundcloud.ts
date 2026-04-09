import type { Context } from "@netlify/functions";

const SC_API = "https://api-v2.soundcloud.com";

let cachedClientId: string | null = null;
let clientIdTimestamp = 0;
const CLIENT_ID_TTL = 1000 * 60 * 60; // 1 hour cache

/**
 * Scrape a fresh client_id from SoundCloud's JS bundles.
 * SoundCloud embeds their client_id in one of the JS files loaded on the homepage.
 */
async function getClientId(): Promise<string> {
  // Use cache if fresh
  if (cachedClientId && Date.now() - clientIdTimestamp < CLIENT_ID_TTL) {
    return cachedClientId;
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  // Fetch the SoundCloud homepage
  const homepageRes = await fetch("https://soundcloud.com", { headers });
  if (!homepageRes.ok) {
    throw new Error("Failed to fetch SoundCloud homepage");
  }
  const html = await homepageRes.text();

  // Extract all JS bundle URLs
  const scriptRegex = /src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g;
  const scripts: string[] = [];
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }

  if (scripts.length === 0) {
    throw new Error("No SoundCloud JS bundles found");
  }

  // Search scripts (from the last ones, where client_id usually lives)
  for (const scriptUrl of scripts.reverse()) {
    try {
      const jsRes = await fetch(scriptUrl, { headers });
      if (!jsRes.ok) continue;
      const jsText = await jsRes.text();
      const clientMatch = jsText.match(/client_id[:=]["']?([a-zA-Z0-9]{32})/);
      if (clientMatch) {
        cachedClientId = clientMatch[1];
        clientIdTimestamp = Date.now();
        return cachedClientId;
      }
    } catch {
      continue;
    }
  }

  throw new Error("Could not extract client_id from SoundCloud");
}

/**
 * Resolve a SoundCloud URL to its API representation using the /resolve endpoint.
 */
async function resolveUrl(
  clientId: string,
  scUrl: string
): Promise<Record<string, any>> {
  const resolveEndpoint = `${SC_API}/resolve?url=${encodeURIComponent(scUrl)}&client_id=${clientId}`;
  const res = await fetch(resolveEndpoint, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to resolve URL: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch full track data for track IDs that only have partial info in playlist responses.
 */
async function getTracksByIds(
  clientId: string,
  ids: number[]
): Promise<Record<string, any>[]> {
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }

  const results: Record<string, any>[] = [];
  for (const chunk of chunks) {
    const idsStr = chunk.join(",");
    const url = `${SC_API}/tracks?ids=${idsStr}&client_id=${clientId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (res.ok) {
      const data = await res.json();
      results.push(...data);
    }
  }
  return results;
}

/**
 * Get the direct streaming URL for a track's transcoding.
 * SoundCloud returns an HLS playlist URL from the transcoding endpoint.
 */
async function getStreamUrl(
  clientId: string,
  transcodingUrl: string
): Promise<string> {
  const url = `${transcodingUrl}?client_id=${clientId}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to get stream URL");
  }
  const data: any = await res.json();
  return data.url;
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "info";
  const scUrl = url.searchParams.get("url");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!scUrl) {
    return new Response(JSON.stringify({ error: "Missing 'url' parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const clientId = await getClientId();

    // ─── ACTION: INFO ───────────────────────────────────────────
    if (action === "info") {
      const resolved = await resolveUrl(clientId, scUrl);

      // Playlist / Set
      if (resolved.kind === "playlist") {
        let tracks = resolved.tracks || [];

        // Playlists often return tracks with only an ID - fetch full data
        const incompleteIds = tracks
          .filter((t: any) => !t.title)
          .map((t: any) => t.id);

        if (incompleteIds.length > 0) {
          const fullTracks = await getTracksByIds(clientId, incompleteIds);
          const fullMap = new Map(fullTracks.map((t) => [t.id, t]));
          tracks = tracks.map((t: any) =>
            t.title ? t : fullMap.get(t.id) || t
          );
        }

        return new Response(
          JSON.stringify({
            type: "playlist",
            title: resolved.title,
            trackCount: resolved.track_count,
            tracks: tracks.map((t: any) => ({
              id: t.id,
              title: t.title || `track-${t.id}`,
              permalink_url: t.permalink_url,
              duration: t.duration,
              artwork_url: t.artwork_url,
            })),
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Single Track
      if (resolved.kind === "track") {
        return new Response(
          JSON.stringify({
            type: "track",
            title: resolved.title,
            trackCount: 1,
            tracks: [
              {
                id: resolved.id,
                title: resolved.title,
                permalink_url: resolved.permalink_url,
                duration: resolved.duration,
                artwork_url: resolved.artwork_url,
              },
            ],
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: `Unsupported resource kind: ${resolved.kind}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ─── ACTION: DOWNLOAD ───────────────────────────────────────
    if (action === "download") {
      // Resolve the track to get transcoding info
      const track = await resolveUrl(clientId, scUrl);

      if (track.kind !== "track" || !track.media?.transcodings) {
        return new Response(
          JSON.stringify({ error: "URL does not point to a streamable track" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Prefer progressive (direct MP3) over HLS for simpler browser downloads
      const transcodings: any[] = track.media.transcodings;
      let transcoding =
        transcodings.find(
          (t) =>
            t.format?.protocol === "progressive" &&
            t.format?.mime_type?.includes("mpeg")
        ) ||
        transcodings.find((t) => t.format?.protocol === "progressive") ||
        transcodings.find((t) => t.format?.protocol === "hls");

      if (!transcoding) {
        return new Response(
          JSON.stringify({ error: "No suitable transcoding found" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get the actual stream URL
      const streamUrl = await getStreamUrl(clientId, transcoding.url);

      if (transcoding.format?.protocol === "progressive") {
        // Progressive = direct MP3 file URL, just proxy it
        const audioRes = await fetch(streamUrl);
        if (!audioRes.ok || !audioRes.body) {
          throw new Error("Failed to fetch audio stream");
        }

        return new Response(audioRes.body, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": transcoding.format?.mime_type || "audio/mpeg",
            "Content-Length":
              audioRes.headers.get("Content-Length") || "0",
          },
        });
      } else {
        // HLS stream - fetch the m3u8 playlist and download all segments
        const m3u8Res = await fetch(streamUrl);
        const m3u8Text = await m3u8Res.text();

        // Extract segment URLs from m3u8
        const segmentUrls = m3u8Text
          .split("\n")
          .filter((line) => line.trim() && !line.startsWith("#"));

        const chunks: ArrayBuffer[] = [];
        for (const segUrl of segmentUrls) {
          const segRes = await fetch(segUrl);
          if (segRes.ok) {
            chunks.push(await segRes.arrayBuffer());
          }
        }

        // Concatenate all segments
        const totalLength = chunks.reduce((sum, buf) => sum + buf.byteLength, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const buf of chunks) {
          combined.set(new Uint8Array(buf), offset);
          offset += buf.byteLength;
        }

        return new Response(combined, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "audio/mpeg",
            "Content-Length": totalLength.toString(),
          },
        });
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use action=info or action=download" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Soundcloud function error:", err);
    return new Response(
      JSON.stringify({
        error: err?.message || err?.toString() || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};
