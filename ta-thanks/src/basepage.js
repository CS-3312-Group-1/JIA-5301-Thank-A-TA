import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from "react";
import "./basepage.css";
import homeIcon from './Assets/Vector.png';
import emptyCard1 from './Assets/card1_Empty.png';
import emptyCard2 from './Assets/card2_Empty.png';
import emptyCard3 from './Assets/Card3_Empty.png';
import emptyCard4 from './Assets/card4_Empty.png';
import emptyCard5 from './Assets/card5_Empty.png';


function BasePage(){
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedCard } = location.state || {};  // Retrieve card data from the router state
    const [textSize, setTextSize] = useState(0);
    const increaseTextSize = () => {
        setTextSize(textSize + 1);
    };
    const decreaseTextSize = () => {
        setTextSize(textSize - 1);
    };

    const handleHomeClick = () => {
        // Confirm if the user wants to discard their changes
        const confirmDiscard = window.confirm("Are you sure you want to discard your changes and go to the home page?");
        if (confirmDiscard) {
            navigate('/');
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
        <><div class="blue-section">
            <p>3 of 3: Edit Card</p>
            <button onClick={handleHomeClick}>
                 <img src={homeIcon} alt="Home" />
            </button>
        </div><div class="container">
                {/* <!-- Card Preview Section (Without the Thank You text) --> */}
                <div class="card-preview">
                    {/* <!-- Card content can be inserted here if needed in the future --> */}
                    <img src={cards[selectedCard - 1]} alt={''}></img>
                </div>

                {/* <!-- Message Box Section --> */}
                <div class="message-box-container">
                    <label for="message">Add a Message</label>
                    <textarea id="message" placeholder="Enter your message here"></textarea>
                    <div class="controls">
                        <button onClick={decreaseTextSize}> - </button>
                        <button onClick={increaseTextSize}> + </button>
                        <p> {textSize + 20} </p> {/* should be changed when actual text size is implemented on card*/}
                    </div>
                    <div class="controls">
                        <button onClick={() => navigate('/search')} href="#" class="back-button">&larr;</button>
                        <button class="send-button">Send Card</button>
                    </div>
                </div>
            </div></>
    );
}
export default BasePage;