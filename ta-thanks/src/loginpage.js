import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import "./loginpage.css";

const LoginPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="login-page-wrapper"> {/* Wrapper for centering only the login page */}
            <div className="login-container">
                <h1>Georgia Tech Login</h1>
                <p>Log in with your Georgia Tech email to send cards to your TAs and teachers.</p>
                
                <form action="/login" method="POST">
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
                            placeholder="Enter your password"
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

                    <input type="submit" value="Login" />
                </form>

                <div className="footer">
                    <p>
                        Not a Georgia Tech student? <a href="/register">Sign up here</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
