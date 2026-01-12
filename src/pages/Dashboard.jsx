import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Sprout, CheckCircle2, ArrowRight, Sun, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { LEVEL_CONFIG } from '../utils/gamification';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [greeting, setGreeting] = useState('Welcome');
    const [stats, setStats] = useState({
        points: 0,
        level: 1,
        xp: 0,
        treesPlanted: 0,
        verifiedPosts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // 1. Listen to Real User Stats & Activities
    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);

        // A. Listen to User Profile (Points, Level, XP)
        const userUnsub = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setStats(prev => ({
                    ...prev,
                    points: data.points || 0,
                    level: data.level || 1,
                    xp: data.xp || 0
                }));
            }
        });

        // B. Listen to Trees Count
        const treesQuery = query(collection(db, "trees"), where("caretakerId", "==", currentUser.uid));
        const treesUnsub = onSnapshot(treesQuery, (snap) => {
            setStats(prev => ({ ...prev, treesPlanted: snap.size }));
        });

        // C. Listen to Verified Posts Count
        const postsQuery = query(collection(db, "posts"), where("userId", "==", currentUser.uid), where("status", "==", "verified"));
        const postsUnsub = onSnapshot(postsQuery, (snap) => {
            setStats(prev => ({ ...prev, verifiedPosts: snap.size }));
        });

        setLoading(false);

        return () => {
            userUnsub();
            treesUnsub();
            postsUnsub();
        };
    }, [currentUser]);

    // Data Integrity Level Calculation
    const requiredXP = stats.level * LEVEL_CONFIG.BASE_XP;
    const progressPercentage = Math.min((stats.xp / requiredXP) * 100, 100);

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="relative z-10 w-full md:w-2/3">
                    <div className="flex items-center space-x-2 text-emerald-600 mb-2 font-medium">
                        <Sun className="w-5 h-5" />
                        <span>{greeting}, {currentUser?.displayName?.split(' ')[0]}!</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to make the planet cooler? 🌍
                    </h1>
                    <p className="text-gray-500 mb-6 max-w-md">
                        Your impact is real. Every tree and verified post helps you grow as a <span className="font-semibold text-emerald-600">Forest Guardian</span>.
                    </p>

                    {/* Progress Bar (Real Data) */}
                    <div className="max-w-sm">
                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                            <span>Level {stats.level}</span>
                            <span>{stats.xp}/{requiredXP} XP</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{requiredXP - stats.xp} XP to next level!</p>
                    </div>
                </div>

                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50"></div>
                <div className="hidden md:flex justify-center items-center w-1/3 z-10">
                    <div className="bg-emerald-50 p-6 rounded-full border border-emerald-100">
                        <Leaf className="w-16 h-16 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Stats Grid (Real Data) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform transition hover:scale-[1.02] cursor-default">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 font-medium text-sm">Total Points</p>
                            <h3 className="text-4xl font-bold mt-1">{loading ? '...' : stats.points}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <Link to="/leaderboard" className="mt-6 flex items-center text-sm font-medium text-indigo-100 hover:text-white transition-colors">
                        View Leaderboard <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg transform transition hover:scale-[1.02] cursor-default">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 font-medium text-sm">Trees Planted</p>
                            <h3 className="text-4xl font-bold mt-1">{loading ? '...' : stats.treesPlanted}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Sprout className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <Link to="/trees" className="mt-6 flex items-center text-sm font-medium text-emerald-100 hover:text-white transition-colors">
                        My Garden <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl p-6 text-white shadow-lg transform transition hover:scale-[1.02] cursor-default">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 font-medium text-sm">Verified Posts</p>
                            <h3 className="text-4xl font-bold mt-1">{loading ? '...' : stats.verifiedPosts}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center text-sm font-medium text-orange-100">
                        {stats.verifiedPosts > 10 ? 'Verified Guardian' : 'Keep posting!'}
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                    <Link to="/feed" className="text-sm text-emerald-600 font-medium hover:underline">View All</Link>
                </div>

                <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Sprout className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">Check the Community Feed</h3>
                    <p className="text-gray-500 text-sm max-w-xs mb-6">
                        See what others are planting and get inspired!
                    </p>
                    <Link to="/feed" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium shadow-md hover:bg-emerald-700 transition-all">
                        Go to Feed
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
