import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const AdminRoute = () => {
    const { user } = useUser();

    if (!user || !user.isAdmin) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default AdminRoute;
