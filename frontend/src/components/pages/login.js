import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import 'react-toastify/dist/ReactToastify.css';
import "../../styles/login.css";
import { API_BASE_URL } from '../../apiConfig';

async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || 'Invalid email or password');
    }

    return data;
}

const LoginPage = ({ setToken }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { setUserEmail } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const authPayload = await loginUser({
                email,
                password,
            });
            setToken(authPayload);
            setUserEmail(authPayload.email);

            if (authPayload.isAdmin) {
                navigate('/admin');
            } else if (authPayload.isTa) {
                navigate('/inbox');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.message || 'Invalid email or password');
            setEmail('');
            setPassword('');
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <>
            <div className="login-page-wrapper">
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
                            value={email}
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
                                value={password}
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
            </div>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </>
    );
};

export default LoginPage;
