import { NavLink } from 'react-router-dom';
import './../../styles/Navbar.css';
import { useUser } from '../../context/UserContext';

const Navbar = ({ title }) => {
    const { user, logout } = useUser();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="navbar">
            <div className="navbar-left">
                {user && (
                    <>
                        Hey, {user.name} ({user.isAdmin ? 'Admin' : user.isTa ? 'TA' : 'Student'})
                    </>
                )}
            </div>

            <div className="navbar-center">{title}</div>

            <div className="navbar-right">
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                    Home
                </NavLink>

                {user && user.isTa && (
                    <NavLink
                        to="/inbox"
                        className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
                    >
                        TA Inbox
                    </NavLink>
                )}

                {user && user.isAdmin && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
                    >
                        Admin
                    </NavLink>
                )}

                {user && <button onClick={handleLogout}>Logout</button>}
            </div>
        </div>
    );
};

export default Navbar;
