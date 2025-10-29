import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../../styles/admin.css';
import { useNavigate } from 'react-router-dom';
import GifPreviewModal from './GifPreviewModal';
import TaManagementModal from './TaManagementModal';
import ConfirmationModal from '../common/ConfirmationModal';
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
    const [semesters, setSemesters] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toggleTarget, setToggleTarget] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isTaModalOpen, setIsTaModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [gifFile, setGifFile] = useState(null);
    const gifInputRef = useRef(null);
    const csvInputRef = useRef(null);

    const fetchSemesters = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:3001/semesters');
            setSemesters(response.data);
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    useEffect(() => {
        fetchSemesters();
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

        setGifFile(file);
        setIsPreviewOpen(true);
    };

    const handleConfirmGif = (file) => {
        setSelectedGif(file);
        setIsPreviewOpen(false);
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
                fetchSemesters();
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
    
    

    const handleDeleteSemester = async (semesterId) => {
        try {
            await axios.delete(`http://127.0.0.1:3001/semesters/${semesterId}`);
            fetchSemesters();
        } catch (error) {
            console.error('Error deleting semester:', error);
        }
    };

    const handleToggleSemester = (semester) => {
        setToggleTarget(semester);
        setIsConfirmOpen(true);
    };

    const confirmToggleSemester = async () => {
        if (!toggleTarget) return;
        try {
            await axios.patch(`http://127.0.0.1:3001/semesters/${toggleTarget._id}/toggle`);
            fetchSemesters();
        } catch (error) {
            console.error('Error toggling semester:', error);
        } finally {
            setIsConfirmOpen(false);
            setToggleTarget(null);
        }
    };

    const openTaManagementModal = (semester) => {
        setSelectedSemester(semester);
        setIsTaModalOpen(true);
    };

    const closeTaManagementModal = () => {
        setSelectedSemester(null);
        setIsTaModalOpen(false);
        fetchSemesters(); // Refresh semesters when closing the modal
    };

    useEffect(() => {
        fetchGifs();
        fetchSemesters();
    }, []);

    useEffect(() => {
        const isModalOpen = isTaModalOpen || isPreviewOpen || isConfirmOpen || !!deleteTarget;
        if (isModalOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        // Cleanup function to remove the class when the component unmounts
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isTaModalOpen, isPreviewOpen, isConfirmOpen, deleteTarget]);

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
        } else if (deleteTarget.type === 'semester') {
            await handleDeleteSemester(deleteTarget.id);
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

                    <h2>Uploaded Semesters</h2>
                    <div className="ta-lists">
                        {semesters.map((semester) => (
                            <div key={semester._id} className="ta-list-item">
                                <span>{semester.semester} - {semester.fileRef}</span>
                                <div>
                                    <button onClick={() => openTaManagementModal(semester)} className="manage-ta-list-btn">
                                        Manage
                                    </button>
                                    <button onClick={() => handleToggleSemester(semester)} className={`toggle-ta-list-btn ${semester.isEnabled ? 'enabled' : 'disabled'}`}>
                                        {semester.isEnabled ? 'Disable' : 'Enable'}
                                    </button>
                                    <FaTrashCan
                                        onClick={() => openDeleteConfirmation({
                                            type: 'semester',
                                            id: semester._id,
                                            name: `${semester.semester} - ${semester.fileRef}`,
                                        })}
                                        size={20}
                                        className='delete-ta-list-btn'
                                        aria-label={`Delete ${semester.semester} - ${semester.fileRef}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmToggleSemester}
                message={`Are you sure you want to ${toggleTarget?.isEnabled ? 'disable' : 'enable'} this semester?`}
            />

            <TaManagementModal
                isOpen={isTaModalOpen}
                onClose={closeTaManagementModal}
                semester={selectedSemester}
                fetchSemesters={fetchSemesters}
            />

            <GifPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                onConfirm={handleConfirmGif}
                file={gifFile}
            />

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