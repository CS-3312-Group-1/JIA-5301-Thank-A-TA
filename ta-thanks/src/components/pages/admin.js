import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/admin.css';
import { useNavigate } from 'react-router-dom';

import homeIcon from '../../assets/Vector.png';

function Admin() {
    const navigate = useNavigate();
    const [selectedGif, setSelectedGif] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [taUploadStatus, setTaUploadStatus] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [gifs, setGifs] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [selectedCsv, setSelectedCsv] = useState(null);
    const [taLists, setTaLists] = useState([]);

    const fetchTaLists = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:3001/tas');
            setTaLists(response.data);
        } catch (error) {
            console.error('Error fetching TA lists:', error);
        }
    };

    useEffect(() => {
        fetchTaLists();
    }, []);

    // Handle GIF selection
    const handleGifSelection = (event) => {
        setSelectedGif(event.target.files[0]);
        setUploadStatus('');
    };

    const handleCsvSelection = (event) => {
        setSelectedCsv(event.target.files[0]);
        setTaUploadStatus('');
    };

    const handleCsvUpload = async () => {
        if (!selectedCsv) {
            setTaUploadStatus('Please select a CSV file before uploading.');
            return;
        }

        const formData = new FormData();
        formData.append('csv', selectedCsv);

        try {
            const response = await axios.post('http://127.0.0.1:3001/upload-tas', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setTaUploadStatus('TA data uploaded successfully!');
                fetchTaLists();
            } else {
                setTaUploadStatus('Failed to upload TA data.');
            }
        } catch (error) {
            console.error('Error uploading TA data:', error);
            setTaUploadStatus('Error uploading TA data.');
        }
    };


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
                fetchGifs(); // Refresh the GIF list
            } else {
                setUploadStatus('Failed to upload GIF.');
            }
        } catch (error) {
            console.error('Error uploading GIF:', error);
            setUploadStatus('Error uploading GIF.');
        }
    };

    const fetchGifs = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:3001/get-gifs');
            console.log(response.data); // Log the response to inspect the data
            setGifs(response.data);
            setFetchError('');
        } catch (error) {
            console.error('Error fetching GIFs:', error);
            setFetchError('Failed to load available GIFs.');
        }
    };

    const handleDeleteGif = async (gifId) => {
        try {
            console.log(`Deleting GIF with ID: ${gifId}`);
            const response = await axios.delete(`http://127.0.0.1:3001/delete-gif/${gifId}`);
            
            if (response.status === 200) {
                setUploadStatus('GIF deleted successfully!');
                fetchGifs(); // Refresh the GIF list
            } else {
                setUploadStatus('Failed to delete GIF.');
            }
        } catch (error) {
            console.error('Error deleting GIF:', error);
            setUploadStatus('Error deleting GIF.');
        }
    };
    
    

    const handleDeleteTaList = async (taListId) => {
        try {
            await axios.delete(`http://127.0.0.1:3001/tas/${taListId}`);
            fetchTaLists();
        } catch (error) {
            console.error('Error deleting TA list:', error);
        }
    };

    useEffect(() => {
        fetchGifs();
        fetchTaLists();
    }, []);

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

            <div className="main-contenta">
                <div className="gif-management">
                    <h2>GIF Management</h2>

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

                    <div className="upload-section">
                        <input
                            type="file"
                            accept="image/gif"
                            onChange={handleGifSelection}
                        />
                        <button onClick={handleGifUpload}>Upload GIF</button>
                    </div>

                    {uploadStatus && <p className="status-message">{uploadStatus}</p>}

                    <h2>Available GIFs</h2>
                    {fetchError && <p className="error-message">{fetchError}</p>}

                    <div className="gif-gallery">
    {gifs.length > 0 ? (
        gifs.map((gif) => (
            <div key={gif._id} className="gif-item">
                <img src={`http://127.0.0.1:3001/get-gif/${gif._id}`} alt={gif.name} />
                <p>{gif.name}</p>
                <button
                    className="delete-button"
                    onClick={() => handleDeleteGif(gif._id)}
                >
                    Delete
                </button>
            </div>
        ))
    ) : (
        <p>No GIFs available.</p>
    )}
</div>


                </div>
                <div className="ta-management">
                    <h2>TA Management</h2>
                    <div className="upload-section">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCsvSelection}
                        />
                        <button onClick={handleCsvUpload}>Upload TA Data</button>
                    </div>
                    {taUploadStatus && <p className="status-message">{taUploadStatus}</p>}

                    <h2>Uploaded TA Lists</h2>
                    <div className="ta-lists">
                        {taLists.map((taList) => (
                            <div key={taList._id} className="ta-list-item">
                                <span>{taList.semester} - {taList.filename}</span>
                                <button onClick={() => handleDeleteTaList(taList._id)} className='delete-ta-list-btn'>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
