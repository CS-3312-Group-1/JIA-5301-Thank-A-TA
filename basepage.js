import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import "./basepage.css";

function basePage(){
    return (
        <><div class="blue-section">
            <p>3 of 3: Edit Card</p>
            <img src="IMG_5713.png" alt="Home Icon" class="home-icon" />
        </div><div class="container">
                {/* <!-- Card Preview Section (Without the Thank You text) --> */}
                <div class="card-preview">
                    {/* <!-- Card content can be inserted here if needed in the future --> */}
                </div>

                {/* <!-- Message Box Section --> */}
                <div class="message-box-container">
                    <label for="message">Add a Message</label>
                    <textarea id="message" placeholder="Enter your message here"></textarea>

                    <div class="controls">
                        <a href="#" class="back-button">&larr;</a>
                        <button class="send-button">Send Card</button>
                    </div>
                </div>
            </div></>
    );
}
export default basePage;