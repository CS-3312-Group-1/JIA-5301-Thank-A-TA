import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = sessionStorage.getItem('token');
        const name = sessionStorage.getItem('name');
        const email = sessionStorage.getItem('email');
        const isTa = sessionStorage.getItem('isTa');
        const isAdmin = sessionStorage.getItem('isAdmin');

        if (token && name && email) {
            return {
                token,
                name,
                email,
                isTa: isTa === 'true',
                isAdmin: isAdmin === 'true'
            };
        }
        return null;
    });

    const login = (userData) => {
        const isTaBool = userData.isTa === 1 || userData.isTa === true;
        const isAdminBool = userData.isAdmin === 1 || userData.isAdmin === true;

        const userToSet = { ...userData, isTa: isTaBool, isAdmin: isAdminBool };
        setUser(userToSet);

        sessionStorage.setItem('token', userData.jwt);
        sessionStorage.setItem('name', userData.name);
        sessionStorage.setItem('email', userData.email);
        sessionStorage.setItem('isTa', isTaBool);
        sessionStorage.setItem('isAdmin', isAdminBool);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.clear();
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
