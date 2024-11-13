import React, { useState } from 'react';
import './registerpage.css';

const RegisterPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const [isTA, setIsTA] = useState(false);
    
    const handleTACheckboxChange = () => {
        setIsTA(!isTA);
    };

    return (
        <div className="register-page-wrapper">
            <div className="register-container">
                <h1>Georgia Tech Registration</h1>
                <p>Register with your Georgia Tech email to send cards to your TAs and teachers.</p>
                
                <form action="/register" method="POST">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your Full Name"
                        required
                    />

                    <label htmlFor="email">Georgia Tech Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="example@gatech.edu"
                        required
                    />
                
            
                    <label htmlFor="password">Password</label>
                    <div className="password-wrapper">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Create a password"
                            required
                        />
                        <span
                            className="eye-icon"
                            onClick={togglePasswordVisibility}
                            role="button"
                            aria-label="Toggle password visibility"
                        >
                            {passwordVisible ? "👁️‍🗨️" : "👁️"}
                        </span>
                    </div>
                    <div className="ta-checkbox">
                            <input
                                type="checkbox"
                                id="isTA"
                                name="isTA"
                                checked={isTA}
                                onChange={handleTACheckboxChange}
                            />
                        <label htmlFor="isTA">I am a TA</label>
                        </div>
                    <input type="submit" value="Register" />
                </form>

                <div className="footer">
                    <p>
                        Already registered? <a href="/login">Log in here</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
