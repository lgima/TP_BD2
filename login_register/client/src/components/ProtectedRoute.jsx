import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/home" />;
    }

    return children;
};

export default ProtectedRoute;