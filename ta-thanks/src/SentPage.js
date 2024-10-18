import React, { useEffect } from 'react';
import './SentPage.css'; // Import the CSS for this component
import { useNavigate } from 'react-router-dom';

const SentPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Navigate away from the sent page after a delay (e.g., after 5 seconds)
        const timer = setTimeout(() => {
            navigate('/'); // Replace with the route you want to go to after the animation
        }, 5000);

        // Cleanup timer when the component unmounts
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="sent-page">
            <div className="overlay"></div>
            <div className="sent-message">
                <h1>SENT!</h1>
            </div>
            <div className="star-particles">
                {[...Array(60)].map((_, index) => {
                    // Generate random values for each star
                    const randomX = Math.random() * 2 - 1;  // Random value between -1 and 1
                    const randomY = Math.random() * 2 - 1;  // Random value between -1 and 1
                    const randomSpeed = Math.random() * 1.5 + 1;

                    return (
                        <div 
                            key={index} 
                            className="star" 
                            style={{ 
                                '--x': randomX, 
                                '--y': randomY, 
                                animationDuration: `${randomSpeed}s`  // Set random speeds
                            }}
                        ></div>
                    );
                })}
            </div>
        </div>
    );
};

export default SentPage;
