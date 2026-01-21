import React, { useEffect, useState } from 'react';
import './NotesWindow.css';

interface NotesWindowProps {
    visible: boolean;
    startX: number; // Percent relative to container width (0-1)
    startY: number; // Percent relative to container height (0-1)
    onClose?: () => void;
}

const FULL_TEXT = `Welcome to my site!

The art on this website was created in Blender, a 3D modeling and animation software. Everything you see is 100% original, with the exception of a couple of assets licensed from other artists. I taught myself Blender about 6 years ago and use it mostly for experimentation and personal projects such as this one. If you want to see more of my work in Blender, reach out to me and I'll be happy to share.
 
 -Matt`

const NotesWindow: React.FC<NotesWindowProps> = ({ visible, startX, startY, onClose }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [typingComplete, setTypingComplete] = useState(false);

    // Typing effect
    useEffect(() => {
        let interval: any;
        let startDelay: any;

        if (visible) {
            setDisplayedText("");
            setTypingComplete(false);
            let index = 0;

            // Delay typing until animation is mostly done (e.g. 500ms)
            startDelay = setTimeout(() => {
                interval = setInterval(() => {
                    if (index < FULL_TEXT.length) {
                        setDisplayedText((prev) => prev + FULL_TEXT.charAt(index));
                        index++;
                    } else {
                        clearInterval(interval);
                        setTypingComplete(true);
                    }
                }, 30); // Typing speed
            }, 600);
        } else {
            setDisplayedText("");
            setTypingComplete(false);
        }

        return () => {
            clearTimeout(startDelay);
            if (interval) clearInterval(interval);
        };
    }, [visible]);

    // CSS variables for dynamic start position
    const style = {
        '--start-x': `${startX * 100}%`,
        '--start-y': `${startY * 100}%`
    } as React.CSSProperties;

    return (
        <div
            className={`notes-window-container ${visible ? 'visible' : ''}`}
            style={style}
        >
            <div className="notes-window-frame">
                <div className="notes-header">
                    <div className="window-controls">
                        <div className="control-dot dot-red" onClick={onClose} />
                        <div className="control-dot dot-yellow" />
                        <div className="control-dot dot-green" />
                    </div>
                    <div className="notes-title">Notes</div>
                    <div style={{ width: 44 }}></div> {/* Spacer for symmetry */}
                </div>
                <div className="notes-body">
                    {displayedText}
                    {!typingComplete && <span className="cursor"></span>}
                </div>
            </div>
        </div>
    );
};

export default NotesWindow;
