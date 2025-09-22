
import React from 'react';
import '../../styles/ConfirmationModal.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{message}</p>
                <div className="modal-actions">
                    <button onClick={onConfirm}>Confirm</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
