import { useEffect, useRef, useState } from 'react';
import './App.css';
import LehighCourses from './components/LehighCourses';
import NotesWindow from './components/NotesWindow';

function App() {
  const [screen1Visible, setScreen1Visible] = useState(true);
  const [buttonsVisible, setButtonsVisible] = useState(false);

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
  const [lehighBackArrowVisible, setLehighBackArrowVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);
  const [notesVisible, setNotesVisible] = useState(false);

  // Video Refs
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const droneVideoRef = useRef<HTMLVideoElement>(null);
  const gitVideoHoverRef = useRef<HTMLVideoElement>(null);
  const linkedinVideoHoverRef = useRef<HTMLVideoElement>(null);
  const linkedinClickVideoRef = useRef<HTMLVideoElement>(null);
  const lehighClickVideoRef = useRef<HTMLVideoElement>(null);
  const blenderVideoHoverRef = useRef<HTMLVideoElement>(null);
  const blenderClickVideoRef = useRef<HTMLVideoElement>(null);
  const lehighImageRef = useRef<HTMLImageElement>(null);
  const backgroundVideo2Ref = useRef<HTMLVideoElement>(null);
  const githubLeaveTimeoutRef = useRef<number | null>(null);
  // Ref for Lehigh Courses container
  const lehighCoursesRef = useRef<HTMLDivElement>(null);

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


  const VIDEO_PATHS = {
    main: "videos/main.mp4",
    drone: "drone.mp4",
    git: "videos/git-hover.mp4",
    linkedin: "videos/linkedin-hover.mp4",
    linkedinClick: "videos/linkedin-click.mp4",
    lehighClick: "videos/lehigh-click.mp4",
    blender: "videos/blender-hover.mp4",
    blenderClick: "videos/blender-click.mp4"
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

    // Position Lehigh Courses Container
    if (lehighCoursesRef.current) {
      const containerStyle = lehighCoursesRef.current.style;
      const w = videoWidth * scale; // Full video width
      const h = videoHeight * scale; // Full video height
      const x = offsetX; // Centered offset
      const y = offsetY;

      containerStyle.left = `${x}px`;
      containerStyle.top = `${y}px`;
      containerStyle.width = `${w}px`;
      containerStyle.height = `${h}px`;
    }
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
    if (buttonsVisible || lehighBackArrowVisible) { // Ensure buttons position correctly when they become visible
      positionButtons();
    }
  }, [buttonsVisible, lehighBackArrowVisible]);


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

  const handleBlenderEnter = () => {
    if (blenderVideoHoverRef.current) {
      blenderVideoHoverRef.current.style.opacity = '1';
      blenderVideoHoverRef.current.play();
    }
  };

  const handleBlenderLeave = () => {
    if (blenderVideoHoverRef.current) {
      blenderVideoHoverRef.current.style.opacity = '0';
      blenderVideoHoverRef.current.pause();
      blenderVideoHoverRef.current.currentTime = 0;
    }
  };

  const handleBlenderClick = () => {
    handleBlenderLeave();
    setButtonsVisible(false);
    setLogoVisible(false);
    if (blenderClickVideoRef.current) {
      blenderClickVideoRef.current.style.opacity = '1';
      blenderClickVideoRef.current.play();
    }
  };

  const handleBlenderClickEnded = () => {
    // Freeze on last frame
    if (blenderClickVideoRef.current) {
      blenderClickVideoRef.current.pause();
    }
    // Open Notes Window
    setNotesVisible(true);
  };

  const handleNotesClose = () => {
    setNotesVisible(false);

    // Reverse Playback Logic
    const vid = blenderClickVideoRef.current;
    if (!vid) return;

    vid.pause();
    const framerate = 30;
    const intervalTime = 1000 / framerate;
    const decrement = 1 / framerate; // reverse normal speed

    const interval = setInterval(() => {
      if (vid.currentTime <= 0) {
        clearInterval(interval);
        vid.pause();
        vid.currentTime = 0;
        vid.style.opacity = '0';
        setButtonsVisible(true);
        setLogoVisible(true);
      } else {
        vid.currentTime = Math.max(0, vid.currentTime - decrement);
      }
    }, intervalTime);
  };


  // Lehigh Logic
  const handleLehighEnter = () => {
    if (lehighImageRef.current) {
      lehighImageRef.current.style.opacity = '1';
    }
  };
  const handleLehighLeave = () => {
    if (lehighImageRef.current) {
      lehighImageRef.current.style.opacity = '0';
    }
  };

  const handleLehighClick = () => {
    handleLehighLeave();
    setButtonsVisible(false);
    if (lehighClickVideoRef.current) {
      lehighClickVideoRef.current.style.opacity = '1';
      lehighClickVideoRef.current.play();
    }
  };

  const handleLehighClickEnded = () => {
    setLehighBackArrowVisible(true);
  };

  const handleLehighBackClick = () => {
    setLehighBackArrowVisible(false);
    const vid = lehighClickVideoRef.current;
    if (!vid) return;

    // Manual Reverse Playback
    vid.pause();
    const framerate = 30;
    const intervalTime = 1000 / framerate;
    const decrement = 1 / framerate; // reverse normal speed

    const interval = setInterval(() => {
      if (vid.currentTime <= 0) {
        clearInterval(interval);
        vid.pause();
        vid.currentTime = 0;
        vid.style.opacity = '0';
        setButtonsVisible(true);
      } else {
        vid.currentTime = Math.max(0, vid.currentTime - decrement);
      }
    }, intervalTime);
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
        <img id="logo" src="logo.png" alt="Logo" style={{ opacity: logoVisible ? 1 : 0, pointerEvents: logoVisible ? 'auto' : 'none' }} />

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

          <video id="blenderVideoHover" muted playsInline style={{ opacity: 0 }} ref={blenderVideoHoverRef}>
            <source src={videoSources.blender || VIDEO_PATHS.blender} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <video
            id="blenderClickVideo"
            muted
            playsInline
            style={{ opacity: 0 }}
            ref={blenderClickVideoRef}
            onEnded={handleBlenderClickEnded}
          >
            <source src={videoSources.blenderClick || VIDEO_PATHS.blenderClick} type="video/mp4" />
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
            id="lehighClickVideo"
            muted
            playsInline
            style={{ opacity: 0 }}
            ref={lehighClickVideoRef}
            onEnded={handleLehighClickEnded}
          >
            <source src={videoSources.lehighClick || VIDEO_PATHS.lehighClick} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <img
            id="lehighVideoHover"
            src="videos/lehigh-hover.png"
            alt="Lehigh Hover"
            style={{ opacity: 0 }}
            ref={lehighImageRef}
          />

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
            onClick={handleLehighClick}
          >
            Button 6 - lehigh
          </button>

          <button
            id="blenderButton"
            className="video-button"
            ref={blenderButtonRef}
            style={{ display: buttonsVisible ? 'block' : 'none' }}
            onMouseEnter={handleBlenderEnter}
            onMouseLeave={handleBlenderLeave}
            onClick={handleBlenderClick}
          >
            Button 7 - blender
          </button>

          <div className={`redirect-overlay ${linkedinRedirecting ? 'visible' : ''}`}>
            REDIRECTING...
          </div>

          <LehighCourses visible={lehighBackArrowVisible} containerRef={lehighCoursesRef} />

          <div
            className={`back-arrow ${lehighBackArrowVisible ? 'visible' : ''}`}
            onClick={handleLehighBackClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" />
            </svg>
          </div>

          <NotesWindow
            visible={notesVisible}
            startX={0.51} // Approx center x of where blender button is
            startY={0.65} // Approx center y of where blender button is
            onClose={handleNotesClose}
          />
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
