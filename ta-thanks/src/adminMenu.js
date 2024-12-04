import React, { useState } from 'react';
import axios from 'axios';
import './adminMenu.css';
import { useNavigate } from 'react-router-dom';
import homeIcon from './Assets/Vector.png';

function AdminMenu() {
    const navigate = useNavigate();
    const [selectedGif, setSelectedGif] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Handle GIF selection
    const handleGifSelection = (event) => {
        setSelectedGif(event.target.files[0]);
        setUploadStatus('');
    };

    // Handle drag events
    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            setSelectedGif(event.dataTransfer.files[0]);
            setUploadStatus('');
        }
    };

    // Handle GIF upload
    const handleGifUpload = async () => {
        if (!selectedGif) {
            setUploadStatus('Please select a GIF before uploading.');
            return;
        }

        const formData = new FormData();

        formData.append('gif', selectedGif);

        try {
            const response = await axios.post('http://127.0.0.1:3001/upload-gif', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                setUploadStatus('GIF uploaded successfully!');
            } else {
                setUploadStatus('Failed to upload GIF.');
            }
        } catch (error) {
            console.error('Error uploading GIF:', error);
            setUploadStatus('Error uploading GIF.');
        }
    };

    return (
        <div className="App">
            <div className="header">
                <div className="title">Administration Menu</div>
                <div className="search">
                    <button onClick={() => navigate('/')}>
                        <img src={homeIcon} alt="Home" />
                    </button>
                </div>
            </div>

            <div className="main-content">
                {/* GIF Management Section */}
                <div className="gif-management">
                    <h2>GIF Management</h2>

                    {/* Drag-and-drop section */}
                    <div
                        className={`drag-drop-box ${isDragging ? 'dragover' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {selectedGif ? (
                            <p>{selectedGif.name}</p>
                        ) : (
                            <p>Drag & drop a GIF here, or click to select a file.</p>
                        )}
                    </div>

                    {/* File input fallback */}
                    <div className="upload-section">
                        <input
                            type="file"
                            accept="image/gif"
                            onChange={handleGifSelection}
                        />
                        <button onClick={handleGifUpload}>Upload GIF</button>
                    </div>

                    {/* Status message */}
                    {uploadStatus && <p className="status-message">{uploadStatus}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminMenu;
