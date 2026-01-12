import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Award } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';

const Profile = () => {
    const { currentUser } = useAuth();
    // Real-time listener for profile updates
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
            if (doc.exists()) setUserData(doc.data());
        });
        return unsubscribe;
    }, [currentUser]);

    // Use derived data or fallback to Auth default
    const displayUser = userData || currentUser;

    // Confetti effect if leader
    useEffect(() => {
        if (userData?.isCommunityLeader) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                disableForReducedMotion: true
            });
        }
    }, [userData?.isCommunityLeader]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-6 relative overflow-hidden">
                {/* Leader Background Effect */}
                {userData?.isCommunityLeader && (
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-9xl">👑</span>
                    </div>
                )}

                {displayUser?.photoURL ? (
                    <div className="relative">
                        <img src={displayUser.photoURL} alt="Profile" className={`w-24 h-24 rounded-full object-cover ${userData?.isCommunityLeader ? 'ring-4 ring-amber-400' : ''}`} />
                        {userData?.isCommunityLeader && (
                            <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full border-2 border-white shadow-lg animate-bounce-in">
                                <span className="text-xl">👑</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-green-600" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        {displayUser?.name || currentUser?.displayName}
                        {userData?.isCommunityLeader && (
                            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                👑 Community Leader
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500">{currentUser?.email}</p>

                    <div className="mt-3 flex space-x-3">
                        {/* Display Local Points */}
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Local: {userData?.localPoints || 0} pts
                        </div>
                        {/* Display Global Points */}
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Global: {userData?.globalPoints || userData?.points || 0} pts
                        </div>

                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Level {userData?.level || 1}
                        </div>
                    </div>
                    {userData?.communityName && (
                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                            <span className="mr-1">📍</span> {userData.communityName}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="mr-2 text-purple-500" /> Badges
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    {/* Show actual badges if available, else placeholders */}
                    {userData?.badges && userData.badges.length > 0 ? (
                        userData.badges.map((badge, idx) => (
                            <div key={idx} className="text-center p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                                <span className="text-2xl">{badge.icon || '🏅'}</span>
                                <p className="mt-2 text-sm font-medium">{badge.name}</p>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="text-center p-4 border rounded-lg bg-gray-50">
                                <span className="text-2xl">🌱</span>
                                <p className="mt-2 text-sm font-medium">New Planter</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-gray-50 bg-opacity-50 opacity-50">
                                <span className="text-2xl">🔒</span>
                                <p className="mt-2 text-sm font-medium">Locked</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Profile;
