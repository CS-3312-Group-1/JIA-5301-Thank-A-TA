import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import "./loginpage.css";


async function loginUser(credentials) {
    return fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json())
}

const LoginPage = ({ setToken }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState();
    const [email, setEmail] = useState();
    const navigate = useNavigate();
    const handleSubmit = async e => {
        e.preventDefault();
        const token = await loginUser({
            "email": email,
            "password" :password
        });
        setToken(token);
        
        if(token.isTa) {
            return navigate('/inbox')
        }else {
            return navigate('/search')
        }
      }
    
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="login-container">
            <h1>Georgia Tech Login</h1>
            <p>Log in with your Georgia Tech email to send cards to your TAs and teachers.</p>
            
            <form action="/login" method="POST" onSubmit={handleSubmit}>
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
                        placeholder="Enter your password"
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

                <input type="submit" value="Login" />
            </form>

            <div className="footer">
                <p>
                    Not a Georgia Tech student? <a href="/register">Sign up here</a>.
                </p>
            </div>
        </div>
    );
};
export default LoginPage;
