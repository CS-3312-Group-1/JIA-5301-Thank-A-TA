import { useNavigate } from 'react-router-dom';
import "./basepage.css";
import homeIcon from './Assets/Vector.png' 


function BasePage(){
    const navigate = useNavigate();
    return (
        <><div class="blue-section">
            <p>3 of 3: Edit Card</p>
            <button onClick={() => navigate('/')}>
                 <img src={homeIcon} alt="Home" />
            </button>
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
export default BasePage;