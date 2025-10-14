import React from 'react';
import '../../styles/ConfirmationModal.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="confirmation-modal-overlay" role="presentation" onClick={onClose}>
            <div
                className="confirmation-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
                aria-describedby="confirmation-modal-message"
                onClick={(event) => event.stopPropagation()}
            >
                <h3 id="confirmation-modal-title">Confirm Action</h3>
                <p id="confirmation-modal-message">{message}</p>
                <div className="confirmation-modal-actions">
                    <button type="button" className="confirm-btn" onClick={onConfirm}>
                        Confirm
                    </button>
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
