import React from 'react';
import { useNavigate } from 'react-router-dom';
import './../../styles/Navbar.css';
import { getUserName, getUserRole } from './../../App';
import homeIcon from '../../assets/Vector.png';

const Navbar = ({ title }) => {
    const navigate = useNavigate();
    const name = getUserName();
    const role = getUserRole() ? 'TA' : 'Student';

    return (
        <div className="navbar">
            <div className="navbar-left">
                Hey, {name} ({role})
            </div>
            <div className="navbar-center">
                {title}
            </div>
            <div className="navbar-right">
                <button onClick={() => {
                    sessionStorage.clear();
                    navigate('/login');
                }}>Logout</button>
                <button onClick={() => navigate('/')} className="home-button">                                                   
                    <img src={homeIcon} alt="Home" />                                                                            
                </button>  
            </div>
        </div>
    );
};

export default Navbar;
