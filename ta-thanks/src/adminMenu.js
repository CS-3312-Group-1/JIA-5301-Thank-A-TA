import React, { useState } from 'react';
import axios from 'axios';
import './adminMenu.css';
import { useNavigate } from 'react-router-dom';
import homeIcon from './Assets/Vector.png';

function AdminMenu() {
    const navigate = useNavigate();
    const [selectedGif, setSelectedGif] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    // Handle GIF selection
    const handleGifSelection = (event) => {
        setSelectedGif(event.target.files[0]);
        setUploadStatus('');
    };

    // Handle GIF upload
    const handleGifUpload = async () => {
        if (!selectedGif) {
            setUploadStatus('Please select a GIF before uploading.');
            return;
        }

        const formData = new FormData();
        
        try {
            const response = await axios.post('http://localhost:3001/upload-gif', formData, {
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
                    <div className="upload-section">
                        <input
                            type="file"
                            accept="image/gif"
                            onChange={handleGifSelection}
                        />
                        <button onClick={handleGifUpload}>Upload GIF</button>
                    </div>
                    {uploadStatus && <p className="status-message">{uploadStatus}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminMenu;
