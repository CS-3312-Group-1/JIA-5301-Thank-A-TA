import React, { useState, useEffect, useRef } from 'react';
import GIF from '../../utils/GIF';
import '../../styles/GifPreviewModal.css';

function GifPreviewModal({ isOpen, onClose, onConfirm, file }) {
    const [gifUrl, setGifUrl] = useState(null);
    const [resizedFile, setResizedFile] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (isOpen && file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const gif = new GIF();
                gif.onload = () => {
                    const maxWidth = 600;
                    let newWidth = gif.width;
                    let newHeight = gif.height;

                    if (gif.width > maxWidth) {
                        newWidth = maxWidth;
                        newHeight = (gif.height * maxWidth) / gif.width;
                    }

                    const canvas = canvasRef.current;
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext('2d');

                    // This is a simplified preview - it only shows the first frame.
                    // A full animated preview would require more complex logic to play the gif on the canvas.
                    ctx.drawImage(gif.image, 0, 0, newWidth, newHeight);

                    // For the purpose of this example, we'll just use the first frame for the preview URL.
                    setGifUrl(canvas.toDataURL());

                    // We will handle the actual resizing on confirm, for now, we just store the file.
                    // In a real-world scenario, you might want to resize all frames of the GIF here.
                    setResizedFile(file);
                };
                gif.load(e.target.result);
            };
            reader.readAsDataURL(file);
        }

        return () => {
            if (gifUrl) {
                URL.revokeObjectURL(gifUrl);
            }
        };
    }, [isOpen, file, gifUrl]);

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        // Here you would ideally pass the resized GIF file.
        // For simplicity, we are passing the original file and the resizing will be handled by the parent.
        onConfirm(resizedFile);
    };

    return (
        <div className="confirmation-modal-overlay" onClick={onClose}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <div>
                    <h2>GIF Preview</h2>
                    <div className="gif-preview-container">
                        <canvas ref={canvasRef} className="gif-preview-canvas"></canvas>
                    </div>
                    <div className="confirmation-modal-actions">
                        <button onClick={onClose} className="cancel-btn">Cancel</button>
                        <button onClick={handleConfirm} className="confirm-btn">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GifPreviewModal;
