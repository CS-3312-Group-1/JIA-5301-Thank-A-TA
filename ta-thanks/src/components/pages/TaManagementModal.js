/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import '../../styles/TaManagementModal.css';

function TaManagementModal({ isOpen, onClose, taList }) {
    console.log('TaManagementModal rendered. isOpen:', isOpen, 'taList:', taList);

    const [tas, setTas] = useState([]);
    const [newTa, setNewTa] = useState({ name: '', email: '' });

    const fetchTasForList = async () => {
        if (taList) {
            try {
                console.log(`Fetching TAs for list ID: ${taList._id}`);
                const response = await axios.get(`http://127.0.0.1:3001/tas/${taList._id}`);
                console.log('API response:', response.data);
                setTas(response.data.tas || []);
            } catch (error) {
                console.error('Error fetching TAs:', error);
            }
        }
    };

    useEffect(() => {
        console.log('useEffect triggered. isOpen:', isOpen, 'taList:', taList);
        if (isOpen) {
            fetchTasForList();
        }
    }, [isOpen, taList]);

    if (!isOpen) {
        return null;
    }

    const handleRemoveTa = async (taId) => {
        try {
            await axios.delete(`http://127.0.0.1:3001/tas/${taList._id}/ta/${taId}`);
            fetchTasForList(); // Refresh the TA list
        } catch (error) {
            console.error('Error removing TA:', error);
        }
    };

    const handleAddTa = async (e) => {
        e.preventDefault();
        const isDuplicate = tas.some(ta => ta.email === newTa.email);
        if (isDuplicate) {
            toast.error('A TA with this email already exists in the list.');
            return;
        }

        try {
            await axios.post(`http://127.0.0.1:3001/tas/${taList._id}/ta`, newTa);
            setNewTa({ name: '', email: '' });
            fetchTasForList(); // Refresh the TA list
        } catch (error) {
            console.error('Error adding TA:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTa(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <div className="confirmation-modal-overlay" onClick={onClose}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <ToastContainer />
                <h2>Manage TAs for {taList.filename}</h2>
                <form onSubmit={handleAddTa} className="add-ta-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="TA Name"
                        value={newTa.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="TA Email"
                        value={newTa.email}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">Add TA</button>
                </form>
                <div className="ta-table-container">
                    <table className="ta-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tas.map((ta, index) => (
                                <tr key={index}>
                                    <td>{ta.name}</td>
                                    <td>{ta.email}</td>
                                    <td>
                                        <button onClick={() => handleRemoveTa(ta._id)} className="remove-ta-btn">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="confirmation-modal-actions">
                    <button onClick={onClose} className="cancel-btn">Close</button>
                </div>
            </div>
        </div>
    );
}

export default TaManagementModal;
