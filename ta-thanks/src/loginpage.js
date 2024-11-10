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
function LoginPage({ setToken }) {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();  

    const handleSubmit = async e => {
        e.preventDefault();
        console.log(username) 
        const token = await loginUser({
          "email": username,
          "password": password,
        });
        setToken(token);
    }

      
    return (
        <div className="login-container">
            <h1>Georgia Tech Login</h1>
            <p>Log in with your Georgia Tech email to send cards to your TAs and teachers.</p>

            <form action="/send_cards" method="POST">
                <label htmlFor="email">Georgia Tech Email</label>
                <input type="email" id="email" name="email" placeholder="example@gatech.edu" value={username} required onChange={e => setUserName(e.target.value)} />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <input type="submit" value="Login" onClick={handleSubmit} />
            </form>

            <div className="footer">
                <p>Not a Georgia Tech student? <a href="/signup">Sign up here</a>.</p>
            </div>
        </div>
    );
}
export default LoginPage