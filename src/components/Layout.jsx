import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { LogOut, TreeDeciduous, User, Bell, ChevronDown } from 'lucide-react';

const Layout = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/feed', label: 'Global Feed' },
        { path: '/community', label: 'My Community' },
        { path: '/trees', label: 'My Trees' },
        { path: '/leaderboard', label: 'Leaderboard' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            {/* Glassmorphism Navbar */}
            <nav className="glass-effect sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="flex items-center group">
                                <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-lg text-white shadow-lg group-hover:scale-105 transition-transform duration-200">
                                    <TreeDeciduous className="w-6 h-6" />
                                </div>
                                <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-600 tracking-tight">
                                    GreenTrack
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex sm:space-x-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(link.path)
                                        ? 'bg-emerald-100/50 text-emerald-700 shadow-sm'
                                        : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell (Visual Only) */}
                            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
                            </button>

                            {/* User Profile Pill */}
                            <div className="flex items-center pl-4 border-l border-slate-200">
                                <Link to="/profile" className="flex items-center space-x-3 group cursor-pointer">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors flex items-center justify-end">
                                            {currentUser?.displayName || 'User'}
                                            {/* We rely on AuthContext potentially having this, or just let Profile page handle the heavy lifting. 
                                                For now, let's keep navbar simple or fetch. 
                                                Actually, let's skip fetching here to avoid complexity/reads. 
                                                If user is leader, they see it on profile/community pages. */}
                                        </p>
                                        <p className="text-xs text-emerald-500 font-medium">Lvl 1 Planter</p>
                                    </div>
                                    <div className="relative">
                                        {currentUser?.photoURL ? (
                                            <img src={currentUser.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white border-2 border-white shadow-md">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white" title="Online"></div>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="ml-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;
