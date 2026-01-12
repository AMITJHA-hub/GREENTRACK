import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    // Wait for loading to finish? 
    // The AuthProvider handles loading state and doesn't render children until loaded.
    // So currentUser will be null or object once rendered here.

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
