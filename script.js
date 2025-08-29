document.addEventListener('DOMContentLoaded', function() {
    const githubButton = document.getElementById('githubButton');
    const droneButton = document.getElementById('droneButton');
    const linkedinButton = document.getElementById('linkedinButton');
    const booksButton = document.getElementById('booksButton');
    const laptopButton = document.getElementById('laptopButton');
    const lehighButton = document.getElementById('lehighButton');
    const video = document.getElementById('backgroundVideo');
    const droneVideo = document.getElementById('droneVideo');
    const gitbounceVideo = document.getElementById('gitbounceVideo');
    
    // Add error handling for videos to prevent black screen
    video.addEventListener('error', function() {
        console.error('Background video error:', video.error);
        // Fallback: show a solid color background
        video.style.display = 'none';
        document.getElementById('screen2').style.backgroundColor = '#000';
    });
    
    gitbounceVideo.addEventListener('error', function() {
        console.error('Gitbounce video error:', gitbounceVideo.error);
        // Fallback: return to background video immediately
        gitbounceVideo.style.opacity = '0';
        video.style.opacity = '1';
    });
    
    // Ensure gitbounce video is loaded and ready
    gitbounceVideo.addEventListener('loadeddata', function() {
        console.log('Gitbounce video loaded successfully');
    });
    
    // Add a safety timeout to prevent infinite black screen
    let hoverTimeout;
    let isHovering = false;

    document.getElementById('nextButton').addEventListener('click', function() {
        document.getElementById('screen1').classList.add('hidden');
        document.getElementById('screen2').classList.remove('hidden');
        setTimeout(() => {
            video.play();
            // Preload gitbounce video to prevent delays
            gitbounceVideo.load();
            showVideoButtons();
        }, 50);
    });

    video.addEventListener('ended', function() {
        this.pause();
    });

    // GitHub button hover functionality
    githubButton.addEventListener('mouseenter', function() {
        isHovering = true;
        
        // Store current video time to return to later
        if (!video.paused) {
            video.dataset.originalTime = video.currentTime;
        }
        
        // Ensure background video is visible and playing
        if (video.paused) {
            video.play();
        }
        
        // Fade out background video smoothly
        video.style.transition = 'opacity 0.3s ease';
        video.style.opacity = '0';
        
        // Show and play gitbounce video with loop
        gitbounceVideo.style.transition = 'opacity 0.3s ease';
        gitbounceVideo.style.opacity = '1';
        gitbounceVideo.loop = true;
        gitbounceVideo.currentTime = 0;
        
        // Ensure gitbounce video is ready before playing
        if (gitbounceVideo.readyState >= 2) {
            gitbounceVideo.play();
        } else {
            gitbounceVideo.addEventListener('canplay', function() {
                if (isHovering) {
                    gitbounceVideo.play();
                }
            }, { once: true });
        }
        
        // Safety timeout to prevent black screen
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            if (isHovering && gitbounceVideo.style.opacity === '1') {
                // If still hovering and gitbounce video is visible, ensure it's playing
                if (gitbounceVideo.paused) {
                    gitbounceVideo.play();
                }
            }
        }, 1000);
    });

    githubButton.addEventListener('mouseleave', function() {
        isHovering = false;
        clearTimeout(hoverTimeout);
        
        // Stop and hide gitbounce video smoothly
        gitbounceVideo.pause();
        gitbounceVideo.style.transition = 'opacity 0.3s ease';
        gitbounceVideo.style.opacity = '0';
        gitbounceVideo.loop = false;
        
        // Return to background video smoothly
        video.style.transition = 'opacity 0.3s ease';
        video.style.opacity = '1';
        
        // Ensure background video is playing
        if (video.paused) {
            video.play();
        }
        
        // If we have a stored time, seek to it, otherwise go to end
        if (video.dataset.originalTime) {
            const seekTime = parseFloat(video.dataset.originalTime);
            if (seekTime >= 0 && seekTime < video.duration) {
                video.currentTime = seekTime;
            }
        } else if (video.duration && !isNaN(video.duration) && video.duration > 0) {
            video.currentTime = Math.max(0, video.duration - 0.1); // Go to near end, but not beyond
        }
    });

    githubButton.addEventListener('click', function() {
        window.location.href = 'https://github.com/marons0n', '_blank', 'noopener';
    });

    droneButton.addEventListener('click', function() {
        // Hide all video buttons
        const buttons = [githubButton, droneButton, linkedinButton, booksButton, laptopButton, lehighButton];
        buttons.forEach(button => button.style.display = 'none');
        
        // Fade out current video
        video.style.opacity = '0';
        
        // Show and play drone video
        droneVideo.style.opacity = '1';
        droneVideo.play();
        
        // When drone video ends
        droneVideo.addEventListener('ended', function() {
            // Redirect to aronson-aerial page
            window.location.href = 'aronson-aerial/index.html', '_blank';
        }, { once: true });
    });

    linkedinButton.addEventListener('click', function() {
        window.location.href = 'https://www.linkedin.com/in/maronson1/', '_blank', 'noopener';
    });

    booksButton.addEventListener('click', function() {
        window.location.href = 'books.html';
    });

    laptopButton.addEventListener('click', function() {
        window.location.href = 'laptop.html';
    });

    lehighButton.addEventListener('click', function() {
        window.location.href = 'lehigh.html';
    });

    function showVideoButtons() {
        setTimeout(() => {
            githubButton.style.display = 'block';
            droneButton.style.display = 'block';
            linkedinButton.style.display = 'block';
            booksButton.style.display = 'block';
            laptopButton.style.display = 'block';
            lehighButton.style.display = 'block';
            positionButtons();
        }, 5000);
    }

    function calculateVideoScaling(containerWidth, containerHeight, videoWidth, videoHeight) {
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

        return { scale, offsetX, offsetY };
    }

    function calculateButtonPositionAndSize(videoScaling, buttonVideoX, buttonVideoY, buttonVideoWidth, buttonVideoHeight) {
        const buttonScreenX = buttonVideoX * videoScaling.scale + videoScaling.offsetX;
        const buttonScreenY = buttonVideoY * videoScaling.scale + videoScaling.offsetY;
        const buttonScreenWidth = buttonVideoWidth * videoScaling.scale;
        const buttonScreenHeight = buttonVideoHeight * videoScaling.scale;

        return {
            button_screen_x: buttonScreenX,
            button_screen_y: buttonScreenY,
            button_screen_width: buttonScreenWidth,
            button_screen_height: buttonScreenHeight
        };
    }

    function positionButtons() {
        const container = video.parentElement;
        const videoScaling = calculateVideoScaling(
            container.clientWidth,
            container.clientHeight,
            video.videoWidth,
            video.videoHeight
        );

        // Define button positions in video (adjust as needed)
        const buttonConfigs = [
            { x: 0.535, y: 0.475, width: 0.105, height: 0.12 },       // Button 1 - github
            { x: 0.32, y: 0.15, width: 0.17, height: 0.12 },        // Button 2 - drone - done
            { x: 0.4, y: 0.56, width: 0.075, height: 0.16 },        // Button 3 - linkedin - done
            { x: 0.34, y: 0.56, width: 0.055, height: 0.2 },        // Button 4 - books - done
            { x: 0.59, y: 0.61, width: 0.1, height: 0.17 },           // Button 5 - laptop - done
            { x: 0.66, y: 0.14, width: 0.11, height: 0.47 }         // Button 6 - lehigh - done
        ];

        const buttons = [githubButton, droneButton, linkedinButton, booksButton, laptopButton, lehighButton];

        buttons.forEach((button, index) => {
            const config = buttonConfigs[index];
            const buttonPosition = calculateButtonPositionAndSize(
                videoScaling,
                video.videoWidth * config.x,
                video.videoHeight * config.y,
                video.videoWidth * config.width,
                video.videoHeight * config.height
            );

            button.style.left = `${buttonPosition.button_screen_x}px`;
            button.style.top = `${buttonPosition.button_screen_y}px`;
            button.style.width = `${buttonPosition.button_screen_width}px`;
            button.style.height = `${buttonPosition.button_screen_height}px`;
        });
    }

    // Call positionButtons when the video metadata is loaded and on window resize
    video.addEventListener('loadedmetadata', positionButtons);
    window.addEventListener('resize', positionButtons);
});
