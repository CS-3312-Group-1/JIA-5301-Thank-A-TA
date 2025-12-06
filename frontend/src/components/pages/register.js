import React, { useState, useEffect } from 'react';
import '../../styles/register.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../../apiConfig';

async function register(credentials) {
    return fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify(credentials)
    }).then(data => data.json());
}

const Register = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const { user, login } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.isAdmin) {
                navigate('/admin');
            } else if (user.isTa) {
                navigate('/inbox');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);
    
    const handleSubmit = async e => {
        e.preventDefault();

        // Backend will check if email exists in tas table and set isTa accordingly
        const token = await register({
            "email": email,
            "password": password,
            "name": name
        });

        login(token);

        if (token.isTa) {
            return navigate('/inbox');
        } else {
            return navigate('/');
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <>
            <div className="register-page-wrapper">
                <div className="register-container">
                    <h1>Georgia Tech Registration</h1>
                    <p>Register with your Georgia Tech email to send cards to your TAs and teachers.</p>

                    <form action="/register" method="POST" onSubmit={handleSubmit}>
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            onChange={e => setName(e.target.value)}
                            placeholder="Your Full Name"
                            required
                        />

                        <label htmlFor="email">Georgia Tech Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="example@gatech.edu"
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Create a password"
                                onChange={e => setPassword(e.target.value)}
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
                        <input type="submit" value="Register" />
                    </form>

                    <div className="footer">
                        <p>
                            Already registered? <a href="/login">Log in here</a>.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
