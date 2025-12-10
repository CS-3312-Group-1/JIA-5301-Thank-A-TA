import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/session`, { credentials: 'include' });
                const data = await response.json();
                if (data.authenticated) {
                    setUser({
                        ...data.user,
                        isTa: !!data.user.isTa,
                        isAdmin: !!data.user.isAdmin
                    });
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    const logout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
            const data = await response.json();
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
        }
    };

    return (
        <UserContext.Provider value={{ user, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
