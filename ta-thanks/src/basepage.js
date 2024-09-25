import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from "react";
import Draggable from 'react-draggable';  // Import Draggable
import "./basepage.css";
import homeIcon from './Assets/Vector.png';
import emptyCard1 from './Assets/card1_Empty.png';
import emptyCard2 from './Assets/card2_Empty.png';
import emptyCard3 from './Assets/Card3_Empty.png';
import emptyCard4 from './Assets/card4_Empty.png';
import emptyCard5 from './Assets/card5_Empty.png';

function BasePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedCard } = location.state || {};  // Retrieve card data from the router state
    const [textSize, setTextSize] = useState(20); // Set default text size to 20
    const [text, setText] = useState(''); // State to store the user's message
    const [textBoxes, setTextBoxes] = useState([]); // Store multiple draggable text boxes

    const increaseTextSize = () => {
        setTextSize(textSize + 1);
    };

    const decreaseTextSize = () => {
        if (textSize > 1) {
            setTextSize(textSize - 1); // Prevent text size from becoming too small
        }
    };

    const handleHomeClick = () => {
        // Confirm if the user wants to discard their changes
        const confirmDiscard = window.confirm("Are you sure you want to discard your changes and go to the hoome page?");
        if (confirmDiscard) {
            navigate('/');
        };
    };

    const handleAddTextBox = () => {
        if (text) {
            setTextBoxes([...textBoxes, { id: textBoxes.length + 1, content: text }]);
            setText(''); // Reset the input box after adding
        }
    };

    const cards = [
        emptyCard1,
        emptyCard2,
        emptyCard3,
        emptyCard4,
        emptyCard5
    ];

    return (
        <>
            <div className="blue-section">
                <p>3 of 3: Edit Card</p>
                <button onClick={handleHomeClick}>
                    <img src={homeIcon} alt="Home" />
                </button>
            </div>
            <div className="container">
                {/* Card Preview Section */}
                <div className="card-preview">
                    <img src={cards[selectedCard - 1]} alt="Selected card" />
                    {textBoxes.map((box) => (
                        <Draggable key={box.id}>
                            <div 
                                className="draggable-text"
                                style={{ fontSize: `${textSize}px`, cursor: 'move', color: 'black' }}
                            >
                                {box.content}
                            </div>
                        </Draggable>
                    ))}
                </div>

                {/* Message Box Section */}
                <div className="message-box-container">
                    <label htmlFor="message">Add a Message</label>
                    <textarea
                        id="message"
                        placeholder="Enter your message here"
                        value={text}
                        onChange={(e) => setText(e.target.value)}  // Track message input
                    />
                    <div className="controls">
                        <button onClick={decreaseTextSize}> - </button>
                        <button onClick={increaseTextSize}> + </button>
                        <p>{textSize}</p> {/* Display current text size */}
                    </div>
                    <div className="controls">
                        <button onClick={() => navigate('/search')} className="back-button">&larr;</button>
                        <button className="send-button">Send Card</button>
                    </div>
                    <button className="add-text-button" onClick={handleAddTextBox}>
                        Add Text to Card
                    </button>
                </div>
            </div>
        </>
    );
}

export default BasePage;


