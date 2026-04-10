import React, { useState } from 'react';
import LiquidEther from './LiquidEther';
import './SoundcloudDownloader.css';

const SoundcloudDownloader: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progressVisibility, setProgressVisibility] = useState(false);
    const [statusText, setStatusText] = useState('Waiting to start...');
    const [statusColorClass, setStatusColorClass] = useState('');
    const [trackInfo, setTrackInfo] = useState('');
    const [progressPercent, setProgressPercent] = useState<number | null>(0);
    const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('mp3');

    const hasValidUrl = url.trim().length > 0 && url.includes('soundcloud.com');

    const triggerBrowserDownload = (blob: Blob, filename: string) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    };

    const encodeWAV = (audioBuffer: AudioBuffer): Blob => {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numberOfChannels * 2; // 16-bit PCM
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);

        const writeString = (view: DataView, offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        // RIFF header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * 2 * numberOfChannels, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, length, true);

        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                let sample = audioBuffer.getChannelData(channel)[i];
                sample = Math.max(-1, Math.min(1, sample));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, sample, true);
                offset += 2;
            }
        }

        return new Blob([buffer], { type: 'audio/wav' });
    };

    const handleDownload = async () => {
        if (!hasValidUrl || isLoading) return;

        setIsLoading(true);
        setProgressVisibility(true);
        setStatusText('Fetching track info...');
        setStatusColorClass('');
        setProgressPercent(null);
        setTrackInfo('');

        try {
            const infoUrl = `/.netlify/functions/soundcloud?action=info&url=${encodeURIComponent(url.trim())}`;
            const infoResponse = await fetch(infoUrl);

            if (!infoResponse.ok) {
                const errorData = await infoResponse.json().catch(() => ({ error: 'Unknown error occurred or function timeout' }));
                throw new Error(errorData.error || infoResponse.statusText);
            }

            const data = await infoResponse.json();

            if (!data.tracks || data.tracks.length === 0) {
                throw new Error('No tracks found for this URL.');
            }

            setStatusText('Processing metadata...');

            for (let i = 0; i < data.tracks.length; i++) {
                const track = data.tracks[i];
                const trackNum = i + 1;

                setTrackInfo(`Track ${trackNum} of ${data.tracks.length}`);
                setStatusText(`Downloading "${track.title}"...`);
                setProgressPercent(0);

                if (!track.permalink_url) {
                    console.warn(`Skipping track ${trackNum} - no permalink URL`);
                    continue;
                }

                try {
                    const safeTitle = track.title.replace(/[\/\\?%*:|"<>]/g, '-');
                    const filename = `${safeTitle}.${downloadFormat}`;

                    const downloadUrl = `/.netlify/functions/soundcloud?action=download&trackId=${track.id}&url=${encodeURIComponent(track.permalink_url)}`;
                    const streamResponse = await fetch(downloadUrl);

                    if (!streamResponse.ok || !streamResponse.body) {
                        const errText = await streamResponse.text().catch(() => 'Unknown stream error');
                        throw new Error(`Failed to download track ${trackNum}: ${errText}`);
                    }

                    const contentLength = streamResponse.headers.get('Content-Length');
                    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

                    let loadedBytes = 0;
                    const chunks: Uint8Array<ArrayBuffer>[] = [];
                    const reader = streamResponse.body.getReader();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        chunks.push(value);
                        loadedBytes += value.length;

                        if (totalBytes > 0) {
                            const percent = Math.floor((loadedBytes / totalBytes) * 100);
                            setProgressPercent(percent);
                            setStatusText(`Downloading "${track.title}"... ${percent}%`);
                        } else {
                            const kb = Math.round(loadedBytes / 1024);
                            setStatusText(`Downloading "${track.title}"... ${kb} KB`);
                        }
                    }

                    if (downloadFormat === 'wav') {
                        setStatusText(`Converting "${track.title}" to WAV...`);
                        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const combinedBuffer = await new Blob(chunks).arrayBuffer();
                        const audioBuffer = await audioCtx.decodeAudioData(combinedBuffer);
                        const wavBlob = encodeWAV(audioBuffer);
                        triggerBrowserDownload(wavBlob, filename);
                        await audioCtx.close();
                    } else {
                        const blob = new Blob(chunks, { type: 'audio/mpeg' });
                        triggerBrowserDownload(blob, filename);
                    }
                } catch (trackError: unknown) {
                    console.error(`Error downloading track ${trackNum}:`, trackError);
                }
            }

            setStatusText('Download complete!');
            setStatusColorClass('cb-success-text');
            setProgressPercent(100);
        } catch (err: unknown) {
            console.error('Download error:', err);
            const message = err instanceof Error ? err.message : 'An error occurred';
            setStatusText(message);
            setStatusColorClass('cb-error-text');
            setProgressPercent(100);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cb-page">
            {/* Full-screen fluid background */}
            <div className="cb-background">
                <LiquidEther
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                    mouseForce={7}
                    cursorSize={100}
                    isViscous
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.6}
                    autoIntensity={1}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            {/* Glassmorphism card */}
            <div className="cb-card-wrapper">
                <div className="cb-card">
                    {/* Logo */}
                    <div className="cb-logo-wrapper">
                        <img
                            src="/cheddarbox-white.png"
                            alt="CheddarBox"
                            className="cb-logo"
                        />
                    </div>


                    <div className="cb-divider" />

                    <div className="cb-input-group">
                        <label htmlFor="url-input" className="cb-label">
                            Playlist or Track URL
                        </label>
                        <div className="cb-input-wrapper">
                            <span className="cb-input-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </span>
                            <input
                                type="url"
                                id="url-input"
                                placeholder="https://soundcloud.com/artist/track"
                                autoComplete="off"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isLoading}
                                className="cb-input"
                            />
                        </div>
                    </div>

                    <div className="cb-input-group">
                        <label className="cb-label">Output Format</label>
                        <div className="cb-format-selector">
                            <button
                                type="button"
                                className={`cb-format-btn ${downloadFormat === 'mp3' ? 'active' : ''}`}
                                onClick={() => setDownloadFormat('mp3')}
                                disabled={isLoading}
                            >
                                MP3
                            </button>
                            <button
                                type="button"
                                className={`cb-format-btn ${downloadFormat === 'wav' ? 'active' : ''}`}
                                onClick={() => setDownloadFormat('wav')}
                                disabled={isLoading}
                            >
                                WAV
                            </button>
                        </div>
                    </div>

                    <button
                        id="download-btn"
                        className={`cb-btn ${(!hasValidUrl || isLoading) ? 'disabled' : ''}`}
                        onClick={handleDownload}
                        disabled={!hasValidUrl || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="cb-spinner" />
                                Downloading...
                            </>
                        ) : (
                            <>Start Download</>
                        )}
                    </button>

                    {progressVisibility && (
                        <div className="cb-progress-section">
                            <div className="cb-status-row">
                                <span className={`cb-status-text ${statusColorClass}`}>{statusText}</span>
                                {trackInfo && <span className="cb-track-badge">{trackInfo}</span>}
                            </div>
                            <div className="cb-progress-track">
                                <div
                                    className={`cb-progress-fill ${progressPercent === null ? 'indeterminate' : ''}`}
                                    style={{
                                        width: progressPercent !== null ? `${progressPercent}%` : '30%',
                                        background: statusColorClass === 'cb-error-text'
                                            ? 'linear-gradient(90deg, #ff3d00, #ff6b35)'
                                            : statusColorClass === 'cb-success-text'
                                                ? 'linear-gradient(90deg, #00e676, #69f0ae)'
                                                : 'linear-gradient(90deg, #5227FF, #FF9FFC)'
                                    }}
                                />
                            </div>
                            {progressPercent !== null && (
                                <div className="cb-progress-pct">{progressPercent}%</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SoundcloudDownloader;
