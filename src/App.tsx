import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [screen1Visible, setScreen1Visible] = useState(true);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [lehighHovering, setLehighHovering] = useState(false);
  /* 
     Initialize isMobile based on window width immediately to avoid 
     showing loading screen on mobile devices.
  */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [videoSources, setVideoSources] = useState<Record<string, string>>({});
  const [linkedinRedirecting, setLinkedinRedirecting] = useState(false);

  // Video Refs
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const droneVideoRef = useRef<HTMLVideoElement>(null);
  const gitVideoHoverRef = useRef<HTMLVideoElement>(null);
  const linkedinVideoHoverRef = useRef<HTMLVideoElement>(null);
  const linkedinClickVideoRef = useRef<HTMLVideoElement>(null);
  const lehighVideoHoverRef = useRef<HTMLVideoElement>(null);
  const backgroundVideo2Ref = useRef<HTMLVideoElement>(null);
  const githubLeaveTimeoutRef = useRef<number | null>(null);

  // Button Refs
  const githubButtonRef = useRef<HTMLButtonElement>(null);
  const githubButtonRef2 = useRef<HTMLButtonElement>(null);
  const droneButtonRef = useRef<HTMLButtonElement>(null);
  const linkedinButtonRef = useRef<HTMLButtonElement>(null);
  const ytButtonRef = useRef<HTMLButtonElement>(null);
  const laptopButtonRef = useRef<HTMLButtonElement>(null);
  const lehighButtonRef = useRef<HTMLButtonElement>(null);
  const blenderButtonRef = useRef<HTMLButtonElement>(null);

  // Constants
  const LEHIGH_PAUSE_TIME = 39 / 24; // ~1.625s

  const VIDEO_PATHS = {
    main: "videos/main.mp4",
    drone: "drone.mp4",
    git: "videos/git-hover.mp4",
    linkedin: "videos/linkedin-hover.mp4",
    linkedinClick: "videos/linkedin-click.mp4",
    lehigh: "videos/lehigh-hover-old.mp4"
  };

  const positionButtons = () => {
    const video = backgroundVideoRef.current;
    if (!video || !video.parentElement) return;

    const container = video.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) return;

    const containerRatio = containerWidth / containerHeight;
    const videoRatio = videoWidth / videoHeight;
    let scale, offsetX = 0, offsetY = 0;

    if (containerRatio > videoRatio) {
      scale = containerWidth / videoWidth;
      offsetY = (containerHeight - (videoHeight * scale)) / 2;
    } else {
      scale = containerHeight / videoHeight;
      offsetX = (containerWidth - (videoWidth * scale)) / 2;
    }

    const videoScaling = { scale, offsetX, offsetY };

    const buttonConfigs = [
      //need 2 for unique shape
      { ref: githubButtonRef, x: 0.535, y: 0.475, width: 0.105, height: 0.12 },
      { ref: githubButtonRef2, x: 0.545, y: 0.595, width: 0.04, height: 0.125 },

      { ref: droneButtonRef, x: 0.4, y: 0.15, width: 0.2, height: 0.12 },
      { ref: linkedinButtonRef, x: 0.4, y: 0.56, width: 0.075, height: 0.16 },
      { ref: ytButtonRef, x: 0.29, y: 0.63, width: 0.08, height: 0.11 },
      { ref: laptopButtonRef, x: 0.59, y: 0.61, width: 0.1, height: 0.17 },
      { ref: lehighButtonRef, x: 0.66, y: 0.14, width: 0.11, height: 0.47 },
      { ref: blenderButtonRef, x: 0.475, y: 0.605, width: 0.07, height: 0.115 }
    ];

    buttonConfigs.forEach(config => {
      const button = config.ref.current;
      if (button) {
        const buttonScreenX = (videoWidth * config.x) * videoScaling.scale + videoScaling.offsetX;
        const buttonScreenY = (videoHeight * config.y) * videoScaling.scale + videoScaling.offsetY;
        const buttonScreenWidth = (videoWidth * config.width) * videoScaling.scale;
        const buttonScreenHeight = (videoHeight * config.height) * videoScaling.scale;

        button.style.left = `${buttonScreenX}px`;
        button.style.top = `${buttonScreenY}px`;
        button.style.width = `${buttonScreenWidth}px`;
        button.style.height = `${buttonScreenHeight}px`;
      }
    });
  };

  useEffect(() => {
    // Navigation check
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry && navEntry.type === 'back_forward') {
      setScreen1Visible(false);
      // setVideoToEnd
      if (backgroundVideoRef.current) {
        const vid = backgroundVideoRef.current;
        const setToEnd = () => { vid.currentTime = vid.duration; };
        if (vid.readyState >= 1) setToEnd();
        else vid.addEventListener('loadedmetadata', setToEnd, { once: true });
      }
      setTimeout(() => {
        setButtonsVisible(true);
        positionButtons();
      }, 0);
    }

    window.addEventListener('resize', positionButtons);

    // Mobile Check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 700);
    };
    // checkMobile(); // Already initialized
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', positionButtons);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Video Preloading
  useEffect(() => {
    // Do not load videos if on mobile
    if (window.innerWidth < 700) {
      setIsLoading(false);
      return;
    }

    const loadVideos = async () => {
      try {
        const videoKeys = Object.keys(VIDEO_PATHS);
        const loadedSources: Record<string, string> = {};
        let loadedCount = 0;

        await Promise.all(videoKeys.map(async (key) => {
          const url = VIDEO_PATHS[key as keyof typeof VIDEO_PATHS];
          const response = await fetch(url);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          loadedSources[key] = objectUrl;

          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / videoKeys.length) * 100));
        }));

        setVideoSources(loadedSources);
        // Add a small delay to ensure users see 100% briefly or smooth transition
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        console.error("Failed to load videos", error);
        // Fallback: If loading fails, try to proceed without blobs (browser might handle it via normal caching/streaming)
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Recalculate positions when switching back to desktop
  useEffect(() => {
    if (!isMobile && buttonsVisible) {
      // Small timeout to ensure DOM is rendered with display: block
      setTimeout(positionButtons, 100);
    }
  }, [isMobile, buttonsVisible]);

  useEffect(() => {
    if (buttonsVisible) { // Ensure buttons position correctly when they become visible
      positionButtons();
    }
  }, [buttonsVisible]);


  const handleNextClick = () => {
    setScreen1Visible(false);
    setTimeout(() => {
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.play();
      }
      setTimeout(() => {
        setButtonsVisible(true);
        positionButtons();
      }, 5000); // 5000ms delay from original script
    }, 300);
  };

  const handleVideoEnded = () => {
    if (backgroundVideoRef.current) backgroundVideoRef.current.pause();
  };

  // Hover Handlers
  const handleGithubEnter = () => {
    if (githubLeaveTimeoutRef.current) {
      clearTimeout(githubLeaveTimeoutRef.current);
      githubLeaveTimeoutRef.current = null;
    }
    if (gitVideoHoverRef.current) {
      gitVideoHoverRef.current.style.opacity = '1';
      gitVideoHoverRef.current.play();
    }
  };
  const handleGithubLeave = () => {
    githubLeaveTimeoutRef.current = setTimeout(() => {
      if (gitVideoHoverRef.current) {
        gitVideoHoverRef.current.style.opacity = '0';
        gitVideoHoverRef.current.pause();
        gitVideoHoverRef.current.currentTime = 0;
      }
    }, 150);
  };

  const handleGithubClick = () => {
    handleGithubLeave();
    window.location.href = 'https://github.com/marons0n';
  };


  const handleLinkedinEnter = () => {
    if (linkedinVideoHoverRef.current) {
      linkedinVideoHoverRef.current.style.opacity = '1';
      linkedinVideoHoverRef.current.play();
    }
  };
  const handleLinkedinLeave = () => {
    if (linkedinVideoHoverRef.current) {
      linkedinVideoHoverRef.current.style.opacity = '0';
      linkedinVideoHoverRef.current.pause();
      linkedinVideoHoverRef.current.currentTime = 0;
    }
  };
  const handleLinkedinClick = () => {
    handleLinkedinLeave();
    setButtonsVisible(false);
    if (linkedinClickVideoRef.current) {
      linkedinClickVideoRef.current.style.opacity = '1';
      linkedinClickVideoRef.current.play();
    }
  };

  const handleLinkedinClickEnded = () => {
    setLinkedinRedirecting(true);
    setTimeout(() => {
      window.open('https://www.linkedin.com/in/maronson1/', '_blank');

      // Reset
      setLinkedinRedirecting(false);
      if (linkedinClickVideoRef.current) {
        linkedinClickVideoRef.current.style.opacity = '0';
        linkedinClickVideoRef.current.pause();
        linkedinClickVideoRef.current.currentTime = 0;
      }
      setButtonsVisible(true);
    }, 3000);
  };


  // Lehigh Logic
  const handleLehighEnter = () => {
    setLehighHovering(true);
    if (lehighVideoHoverRef.current) {
      if (lehighVideoHoverRef.current.currentTime > LEHIGH_PAUSE_TIME + 0.1) {
        lehighVideoHoverRef.current.currentTime = 0;
      }
      lehighVideoHoverRef.current.style.opacity = '1';
      lehighVideoHoverRef.current.play();
    }
  };
  const handleLehighLeave = () => {
    setLehighHovering(false);
    if (lehighVideoHoverRef.current) {
      lehighVideoHoverRef.current.play(); // Resume
    }
  };

  // Drone Logic
  const handleDroneClick = () => {
    // Hide buttons
    setButtonsVisible(false); // Or just hide via style as original did
    // Actually original hides them by style display='none'. 
    // If I set state false, they disappear. 

    if (backgroundVideoRef.current) backgroundVideoRef.current.style.opacity = '0';
    if (droneVideoRef.current) {
      droneVideoRef.current.style.opacity = '1';
      droneVideoRef.current.play();

      droneVideoRef.current.addEventListener('ended', () => {
        // window.location.href = ... 
      }, { once: true });
    }
  }

  // Lehigh Time Update
  const handleLehighTimeUpdate = () => {
    const vid = lehighVideoHoverRef.current;
    if (lehighHovering && vid && !vid.paused && vid.currentTime >= LEHIGH_PAUSE_TIME) {
      vid.pause();
      if (vid.currentTime > LEHIGH_PAUSE_TIME + 0.1) {
        vid.currentTime = LEHIGH_PAUSE_TIME;
      }
    }
  };

  const handleLehighEnded = () => {
    if (lehighVideoHoverRef.current) {
      lehighVideoHoverRef.current.style.opacity = '0';
      lehighVideoHoverRef.current.currentTime = 0;
    }
  }

  if (isMobile) {
    return (
      <div className="mobile-warning">
        <h1>DESKTOP EXPERIENCE ONLY</h1>
        <p>Please visit on a computer.</p>
        <p>Trust me its worth it.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <h1>LOADING EXPERIENCE... {loadingProgress}%</h1>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: isMobile ? 'none' : 'block' }}>
        <img id="logo" src="logo.png" alt="Logo" />

        {/* Screen 1 */}
        <div id="screen1" className={`screen ${!screen1Visible ? 'hidden' : ''}`}>
          <div className="centered">
            <p id="text1">MATT ARONSON</p>
            <p id="text2">welcome to my portfolio</p>
            <button id="nextButton" onClick={handleNextClick}>explore</button>
          </div>
        </div>

        {/* Screen 2 */}
        <div id="screen2" className={`screen ${screen1Visible ? 'hidden' : ''}`}>
          <video
            id="backgroundVideo"
            muted
            playsInline
            ref={backgroundVideoRef}
            onEnded={handleVideoEnded}
            onLoadedMetadata={positionButtons}
          >
            <source src={videoSources.main || VIDEO_PATHS.main} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <video id="droneVideo" autoPlay muted playsInline style={{ opacity: 0 }} ref={droneVideoRef}>
            <source src={videoSources.drone || VIDEO_PATHS.drone} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <video id="gitVideoHover" loop muted playsInline style={{ opacity: 0 }} ref={gitVideoHoverRef}>
            <source src={videoSources.git || VIDEO_PATHS.git} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <video id="linkedinVideoHover" muted playsInline style={{ opacity: 0 }} ref={linkedinVideoHoverRef}>
            <source src={videoSources.linkedin || VIDEO_PATHS.linkedin} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <video
            id="linkedinClickVideo"
            muted
            playsInline
            style={{ opacity: 0 }}
            ref={linkedinClickVideoRef}
            onEnded={handleLinkedinClickEnded}
          >
            <source src={videoSources.linkedinClick || VIDEO_PATHS.linkedinClick} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <video
            id="lehighVideoHover"
            muted
            playsInline
            style={{ opacity: 0 }}
            ref={lehighVideoHoverRef}
            onTimeUpdate={handleLehighTimeUpdate}
            onEnded={handleLehighEnded}
          >
            <source src={videoSources.lehigh || VIDEO_PATHS.lehigh} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <button
            id="githubButton"
            className="video-button"
            ref={githubButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
            onMouseEnter={handleGithubEnter}
            onMouseLeave={handleGithubLeave}
            onClick={handleGithubClick}
          >
            Button 1 - github
          </button>

          <button
            id="githubButton2"
            className="video-button"
            ref={githubButtonRef2}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
            onMouseEnter={handleGithubEnter}
            onMouseLeave={handleGithubLeave}
            onClick={handleGithubClick}
          >
            Button 1 - github
          </button>

          <button
            id="droneButton"
            className="video-button"
            ref={droneButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
            onClick={handleDroneClick}
          >
            Button 2 - drone
          </button>

          <button
            id="linkedinButton"
            className="video-button"
            ref={linkedinButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
            onMouseEnter={handleLinkedinEnter}
            onMouseLeave={handleLinkedinLeave}
            onClick={handleLinkedinClick}
          >
            Button 3 - linkedin
          </button>

          <button
            id="booksButton"
            className="video-button"
            ref={ytButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
          >
            Button 4 - books
          </button>

          <button
            id="laptopButton"
            className="video-button"
            ref={laptopButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
          >
            Button 5 - laptop
          </button>

          <button
            id="lehighButton"
            className="video-button"
            ref={lehighButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
            onMouseEnter={handleLehighEnter}
            onMouseLeave={handleLehighLeave}
          >
            Button 6 - lehigh
          </button>

          <button
            id="blenderButton"
            className="video-button"
            ref={blenderButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
          >
            Button 7 - blender
          </button>

          <div className={`redirect-overlay ${linkedinRedirecting ? 'visible' : ''}`}>
            REDIRECTING...
          </div>
        </div>

        {/* Screen 3 */}
        <div id="screen3" className="screen hidden">
          <video id="backgroundVideo2" muted playsInline ref={backgroundVideo2Ref}>
            <source src={videoSources.main || VIDEO_PATHS.main} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </>
  )
}

export default App
