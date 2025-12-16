import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [screen1Visible, setScreen1Visible] = useState(true);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [lehighHovering, setLehighHovering] = useState(false);

  // Video Refs
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const droneVideoRef = useRef<HTMLVideoElement>(null);
  const gitVideoHoverRef = useRef<HTMLVideoElement>(null);
  const linkedinVideoHoverRef = useRef<HTMLVideoElement>(null);
  const lehighVideoHoverRef = useRef<HTMLVideoElement>(null);
  const backgroundVideo2Ref = useRef<HTMLVideoElement>(null);

  // Button Refs
  const githubButtonRef = useRef<HTMLButtonElement>(null);
  const droneButtonRef = useRef<HTMLButtonElement>(null);
  const linkedinButtonRef = useRef<HTMLButtonElement>(null);
  const booksButtonRef = useRef<HTMLButtonElement>(null);
  const laptopButtonRef = useRef<HTMLButtonElement>(null);
  const lehighButtonRef = useRef<HTMLButtonElement>(null);

  // Constants
  const LEHIGH_PAUSE_TIME = 39 / 24; // ~1.625s

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
      { ref: githubButtonRef, x: 0.535, y: 0.475, width: 0.105, height: 0.12 },
      { ref: droneButtonRef, x: 0.32, y: 0.15, width: 0.17, height: 0.12 },
      { ref: linkedinButtonRef, x: 0.4, y: 0.56, width: 0.075, height: 0.16 },
      { ref: booksButtonRef, x: 0.34, y: 0.56, width: 0.055, height: 0.2 },
      { ref: laptopButtonRef, x: 0.59, y: 0.61, width: 0.1, height: 0.17 },
      { ref: lehighButtonRef, x: 0.66, y: 0.14, width: 0.11, height: 0.47 }
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
    return () => window.removeEventListener('resize', positionButtons);
  }, []);

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
    if (gitVideoHoverRef.current) {
      gitVideoHoverRef.current.style.opacity = '1';
      gitVideoHoverRef.current.play();
    }
  };
  const handleGithubLeave = () => {
    if (gitVideoHoverRef.current) {
      gitVideoHoverRef.current.style.opacity = '0';
      gitVideoHoverRef.current.pause();
      gitVideoHoverRef.current.currentTime = 0;
    }
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
    window.location.href = 'https://www.linkedin.com/in/maronson1/';
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

  return (
    <>
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
          <source src="videos/main0000-0120.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <video id="droneVideo" autoPlay muted playsInline style={{ opacity: 0 }} ref={droneVideoRef}>
          <source src="drone.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <video id="gitVideoHover" loop muted playsInline style={{ opacity: 0 }} ref={gitVideoHoverRef}>
          <source src="videos/git_hover0120-0140.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <video id="linkedinVideoHover" muted playsInline style={{ opacity: 0 }} ref={linkedinVideoHoverRef}>
          <source src="videos/linkedin_hover0120-0130.mp4" type="video/mp4" />
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
          <source src="videos/lehigh_hover0120-0190.mp4" type="video/mp4" />
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
          ref={booksButtonRef}
          style={{ display: buttonsVisible ? 'block' : 'none' }}
        // onClick={() => window.location.href = 'books.html'}
        >
          Button 4 - books
        </button>

        <button
          id="laptopButton"
          className="video-button"
          ref={laptopButtonRef}
          style={{ display: buttonsVisible ? 'block' : 'none' }}
        // onClick={() => window.location.href = 'laptop.html'}
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
        // onClick={() => window.location.href = 'lehigh.html'}
        >
          Button 6 - lehigh
        </button>
      </div>

      {/* Screen 3 */}
      <div id="screen3" className="screen hidden">
        <video id="backgroundVideo2" muted playsInline ref={backgroundVideo2Ref}>
          <source src="videos/main0000-0120.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </>
  )
}

export default App
