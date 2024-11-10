import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import "./loginpage.css";

function LoginPage() {
    return (
        <div className="login-container">
            <h1>Georgia Tech Login</h1>
            <p>Log in with your Georgia Tech email to send cards to your TAs and teachers.</p>

            <form action="/send_cards" method="POST">
                <label htmlFor="email">Georgia Tech Email</label>
                <input type="email" id="email" name="email" placeholder="example@gatech.edu" required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required />

                <input type="submit" value="Login" />
            </form>

            <div className="footer">
                <p>Not a Georgia Tech student? <a href="/signup">Sign up here</a>.</p>
            </div>
        </div>
    );
}
