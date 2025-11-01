/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import '../../styles/TaManagementModal.css';
import ConfirmationModal from '../common/ConfirmationModal';

const getTaId = (ta) => ta?._id || ta?.id;

function TaManagementModal({ isOpen, onClose, semester }) {
    const [tas, setTas] = useState([]);
    const [originalTas, setOriginalTas] = useState([]);
    const [newTa, setNewTa] = useState({ name: '', email: '', class: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [taToRemove, setTaToRemove] = useState(null);

    const fetchTasForSemester = async () => {
        if (semester) {
            try {
                const response = await axios.get(`http://127.0.0.1:3001/tas/${semester.semester}`);
                setTas(response.data || []);
                setOriginalTas(response.data || []);
            } catch (error) {
                console.error('Error fetching TAs:', error);
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTasForSemester();
        }
    }, [isOpen, semester]);

    const handleRemoveTa = async () => {
        if (!taToRemove) return;
        const taId = getTaId(taToRemove);
        if (!taId) {
            toast.error('Unable to identify TA to remove.');
            return;
        }
        try {
            await axios.delete(`http://127.0.0.1:3001/tas/${taId}`);
            fetchTasForSemester(); // Refresh the TA list
            toast.success('TA removed successfully!');
        } catch (error) {
            console.error('Error removing TA:', error);
            toast.error('Error removing TA.');
        } finally {
            setShowRemoveConfirm(false);
            setTaToRemove(null);
        }
    };

    const openRemoveConfirm = (ta) => {
        setTaToRemove(ta);
        setShowRemoveConfirm(true);
    };

    const handleAddTa = async (e) => {
        e.preventDefault();
        const isDuplicate = tas.some(ta => ta.email === newTa.email);
        if (isDuplicate) {
            toast.error('A TA with this email already exists in the list.');
            return;
        }

        try {
            await axios.post(`http://127.0.0.1:3001/tas/${semester.semester}`, newTa);
            setNewTa({ name: '', email: '', class: '' });
            fetchTasForSemester(); // Refresh the TA list
            toast.success('TA added successfully!');
        } catch (error) {
            console.error('Error adding TA:', error);
            toast.error('Error adding TA.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTa(prevState => ({ ...prevState, [name]: value }));
    };

    const handleTaInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedTas = [...tas];
        const targetId = getTaId(sortedAndFilteredTas[index]);
        const originalIndex = tas.findIndex(ta => getTaId(ta) === targetId);
        updatedTas[originalIndex] = { ...updatedTas[originalIndex], [name]: value };
        setTas(updatedTas);
    };

    const handleUpdateTa = async (index) => {
        const taToUpdate = sortedAndFilteredTas[index];
        const taId = getTaId(taToUpdate);
        if (!taId) {
            toast.error('Unable to identify TA to update.');
            return;
        }
        try {
            await axios.put(`http://127.0.0.1:3001/tas/${taId}`, taToUpdate);
            fetchTasForSemester(); // Refresh the TA list
            toast.success('TA updated successfully!');
        } catch (error) {
            console.error('Error updating TA:', error);
            toast.error('Error updating TA.');
        }
    };

    const isTaChanged = (index) => {
        const currentTa = sortedAndFilteredTas[index];
        const currentId = getTaId(currentTa);
        const originalTa = originalTas.find(ta => getTaId(ta) === currentId);
        return JSON.stringify(currentTa) !== JSON.stringify(originalTa);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredTas = useMemo(() => {
        let sortableTas = [...tas];
        if (sortConfig.key !== null) {
            sortableTas.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        if (searchTerm) {
            return sortableTas.filter(ta =>
                ta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ta.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return sortableTas;
    }, [tas, sortConfig, searchTerm]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="confirmation-modal-overlay" onClick={onClose}>
            <div className="ta-management-modal" onClick={(e) => e.stopPropagation()}>
                <ToastContainer />
                <h2>Manage TAs for {semester?.semester}</h2>
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
                    <input
                        type="text"
                        name="class"
                        placeholder="Class"
                        value={newTa.class}
                        onChange={handleInputChange}
                    />
                    <button type="submit">Add TA</button>
                </form>

                <input
                    type="text"
                    placeholder="Search by name or email"
                    className="search-bar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="ta-table-container">
                    <table className="ta-table">
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('name')}>Name</th>
                                <th onClick={() => requestSort('email')}>Email</th>
                                <th onClick={() => requestSort('class')}>Class</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredTas.map((ta, index) => (
                                <tr key={ta._id || ta.id || ta.email || index}>
                                    <td><input type="text" name="name" value={ta.name} onChange={(e) => handleTaInputChange(e, index)} /></td>
                                    <td><input type="email" name="email" value={ta.email} onChange={(e) => handleTaInputChange(e, index)} /></td>
                                    <td><input type="text" name="class" value={ta.class} onChange={(e) => handleTaInputChange(e, index)} /></td>
                                    <td>
                                        <button onClick={() => handleUpdateTa(index)} className="update-ta-btn" disabled={!isTaChanged(index)}>Update</button>
                                        <button onClick={() => openRemoveConfirm(ta)} className="remove-ta-btn">Remove</button>
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
            <ConfirmationModal
                isOpen={showRemoveConfirm}
                onClose={() => setShowRemoveConfirm(false)}
                onConfirm={handleRemoveTa}
                message={`Are you sure you want to remove ${taToRemove?.name}?`}
            />
        </div>
    );
}

export default TaManagementModal;
