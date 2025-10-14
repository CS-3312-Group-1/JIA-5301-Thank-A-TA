import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../../styles/admin.css';
import { useNavigate } from 'react-router-dom';
import { FaTrashCan } from 'react-icons/fa6';

function Admin() {
    const navigate = useNavigate();
    const [selectedGif, setSelectedGif] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [taUploadStatus, setTaUploadStatus] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingCsv, setIsDraggingCsv] = useState(false);
    const [gifs, setGifs] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [selectedCsv, setSelectedCsv] = useState(null);
    const [taLists, setTaLists] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const gifInputRef = useRef(null);
    const csvInputRef = useRef(null);

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
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (file.type !== 'image/gif') {
            setUploadStatus('Please select a GIF file.');
            return;
        }

        setSelectedGif(file);
        setUploadStatus('');
    };

    const handleCsvSelection = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setTaUploadStatus('Please select a CSV file.');
            return;
        }

        setSelectedCsv(file);
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
                setSelectedCsv(null);
                if (csvInputRef.current) {
                    csvInputRef.current.value = '';
                }
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
            const file = event.dataTransfer.files[0];
            if (file.type !== 'image/gif') {
                setUploadStatus('Please select a GIF file.');
                return;
            }

            setSelectedGif(file);
            setUploadStatus('');

            if (gifInputRef.current) {
                gifInputRef.current.value = '';
            }
        }
    };

    const handleCsvDragOver = (event) => {
        event.preventDefault();
        setIsDraggingCsv(true);
    };

    const handleCsvDragLeave = () => {
        setIsDraggingCsv(false);
    };

    const handleCsvDrop = (event) => {
        event.preventDefault();
        setIsDraggingCsv(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];

            if (!file.name.toLowerCase().endsWith('.csv')) {
                setTaUploadStatus('Please select a CSV file.');
                return;
            }

            setSelectedCsv(file);
            setTaUploadStatus('');

            if (csvInputRef.current) {
                csvInputRef.current.value = '';
            }
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
                setSelectedGif(null);
                if (gifInputRef.current) {
                    gifInputRef.current.value = '';
                }
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

    const handleToggleTaList = async (taListId) => {
        try {
            await axios.patch(`http://127.0.0.1:3001/tas/${taListId}/toggle`);
            fetchTaLists();
        } catch (error) {
            console.error('Error toggling TA list:', error);
        }
    };

    useEffect(() => {
        fetchGifs();
        fetchTaLists();
    }, []);

    const openDeleteConfirmation = (target) => {
        setDeleteTarget(target);
    };

    const closeDeleteConfirmation = () => {
        setDeleteTarget(null);
    };

    const confirmDeletion = async () => {
        if (!deleteTarget) {
            return;
        }

        if (deleteTarget.type === 'gif') {
            await handleDeleteGif(deleteTarget.id);
        } else if (deleteTarget.type === 'ta') {
            await handleDeleteTaList(deleteTarget.id);
        }

        setDeleteTarget(null);
    };

    return (
        <div className="App">
            <div className="header">
                <div className="title">Administration Menu</div>
                <div className="search">
                    <button onClick={() => {
                        sessionStorage.clear();
                        navigate('/login');
                    }}>Logout</button>
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
                        onClick={() => gifInputRef.current?.click()}
                    >
                        {selectedGif ? (
                            <p>{selectedGif.name}</p>
                        ) : (
                            <p>Drag & drop a GIF here, or click to select a file.</p>
                        )}
                    </div>

                    <div className="upload-section gif-upload-section">
                        <input
                            ref={gifInputRef}
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
                                <div className="gif-footer">
                                    <p className="gif-name">{gif.name}</p>
                                    <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() => openDeleteConfirmation({ type: 'gif', id: gif._id, name: gif.name })}
                                        aria-label={`Delete ${gif.name}`}
                                    >
                                        <FaTrashCan size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No GIFs available.</p>
                    )}
                </div>


                </div>
                <div className="ta-management">
                    <h2>TA Management</h2>
                    <div
                        className={`drag-drop-box csv-drop-box ${isDraggingCsv ? 'dragover' : ''}`}
                        onDragOver={handleCsvDragOver}
                        onDragLeave={handleCsvDragLeave}
                        onDrop={handleCsvDrop}
                        onClick={() => csvInputRef.current?.click()}
                    >
                        {selectedCsv ? (
                            <p>{selectedCsv.name}</p>
                        ) : (
                            <p>Drag & drop a TA CSV here, or click to select a file.</p>
                        )}
                    </div>
                    <div className="upload-section ta-upload-section">
                        <input
                            ref={csvInputRef}
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
                                <div>
                                    <button onClick={() => handleToggleTaList(taList._id)} className={`toggle-ta-list-btn ${taList.isEnabled ? 'enabled' : 'disabled'}`}>
                                        {taList.isEnabled ? 'Disable' : 'Enable'}
                                    </button>
                                    <FaTrashCan
                                        onClick={() => openDeleteConfirmation({
                                            type: 'ta',
                                            id: taList._id,
                                            name: `${taList.semester} - ${taList.filename}`,
                                        })}
                                        size={20}
                                        className='delete-ta-list-btn'
                                        aria-label={`Delete ${taList.semester} - ${taList.filename}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {deleteTarget && (
                <div className="confirmation-backdrop" role="presentation" onClick={closeDeleteConfirmation}>
                    <div
                        className="confirmation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-delete-title"
                        aria-describedby="confirm-delete-message"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3 id="confirm-delete-title">Confirm Deletion</h3>
                        <p id="confirm-delete-message">
                            Are you sure you want to delete {deleteTarget.name}?
                        </p>
                        <div className="confirmation-actions">
                            <button type="button" className="cancel-delete-btn" onClick={closeDeleteConfirmation}>
                                Cancel
                            </button>
                            <button type="button" className="confirm-delete-btn" onClick={confirmDeletion}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
