// RegisterPage.js
import React, { useState } from 'react';
import './registerpage.css';

async function register(credentials) {
    return fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json())
}



const RegisterPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState();
    const [email, setEmail] = useState();
    const [name, setName] = useState();
    const [isTa, setIsTa] = useState();

    const handleSubmit = async e => {
        e.preventDefault();
        const token = await register({
            "email": email,
            "password": password,
            "fullname": name,
            "isTa": isTa
        });
        setToken(token);
      }
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="register-container">
            <h1>Georgia Tech Registration</h1>
            <p>Register with your Georgia Tech email to send cards to your TAs and teachers.</p>
            
            <form action="/register" method="POST" onSubmit={handleSubmit}>
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

                <input type="submit" value="Register" />
            </form>

            <div className="footer">
                <p>
                    Already registered? <a href="/login">Log in here</a>.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
