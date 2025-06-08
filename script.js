document.addEventListener('DOMContentLoaded', function() {
    const githubButton = document.getElementById('githubButton');
    const droneButton = document.getElementById('droneButton');
    const linkedinButton = document.getElementById('linkedinButton');
    const booksButton = document.getElementById('booksButton');
    const laptopButton = document.getElementById('laptopButton');
    const lehighButton = document.getElementById('lehighButton');
    const video = document.getElementById('backgroundVideo');
    const droneVideo = document.getElementById('droneVideo');

    document.getElementById('nextButton').addEventListener('click', function() {
        document.getElementById('screen1').classList.add('hidden');
        document.getElementById('screen2').classList.remove('hidden');
        setTimeout(() => {
            video.play();
            showVideoButtons();
        }, 50);
    });

    video.addEventListener('ended', function() {
        this.pause();
    });

    githubButton.addEventListener('click', function() {
        window.location.href = 'github.html';
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
            // Fade out drone video
            droneVideo.style.opacity = '0';
            // Fade in original video
            video.style.opacity = '1';
            // Show buttons again
            buttons.forEach(button => button.style.display = 'block');
        }, { once: true });
    });

    linkedinButton.addEventListener('click', function() {
        window.location.href = 'linkedin.html';
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
