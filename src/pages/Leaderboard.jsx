import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Crown, Shield } from 'lucide-react';

const Leaderboard = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'communities'
    const [communities, setCommunities] = useState([]);

    useEffect(() => {
        // Fetch Users
        const qUsers = query(collection(db, "users"), orderBy("points", "desc"), limit(20));
        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
            setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Fetch Top Communities
        const qComm = query(collection(db, "communities"), orderBy("communityPoints", "desc"), limit(10));
        const unsubComm = onSnapshot(qComm, (snapshot) => {
            setCommunities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubUsers();
            unsubComm();
        };
    }, []);

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return 'bg-gradient-to-b from-yellow-50 to-amber-100 border-amber-300 shadow-amber-100';
            case 1: return 'bg-gradient-to-b from-gray-50 to-slate-100 border-slate-300 shadow-slate-100';
            case 2: return 'bg-gradient-to-b from-orange-50 to-orange-100 border-orange-300 shadow-orange-100';
            default: return 'bg-white border-gray-100';
        }
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Crown className="w-6 h-6 text-amber-500 fill-current animate-bounce" />;
            case 1: return <Medal className="w-6 h-6 text-slate-400 fill-current" />;
            case 2: return <Medal className="w-6 h-6 text-orange-400 fill-current" />;
            default: return <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
            <div className="text-center mb-8 pt-4">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-3 tracking-wider uppercase">
                    Weekly Challenge
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
                <p className="text-gray-500">Compete to become the ultimate Forest Guardian.</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        Top Planters
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'communities' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        Top Communities
                    </button>
                </div>
            </div>

            {activeTab === 'users' ? (
                <>
                    {/* Users List (Existing Logic) */}
                    {/* Top 3 Podium ... */}
                    {users.length >= 3 && (
                        <div className="flex justify-center items-end space-x-4 mb-12 px-4 h-48">
                            {/* 2nd Place */}
                            <div className="w-1/3 max-w-[140px] flex flex-col items-center">
                                <div className="relative mb-3">
                                    {users[1].profilePhoto ?
                                        <img src={users[1].profilePhoto} className="w-16 h-16 rounded-full border-4 border-slate-200" /> :
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 border-4 border-slate-200">{users[1].name[0]}</div>
                                    }
                                    <div className="absolute -bottom-2 translate-x-1/2 right-1/2 bg-slate-200 text-slate-600 border border-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">2</div>
                                </div>
                                <div className="text-center w-full bg-slate-50 rounded-t-xl p-3 border-t border-x border-slate-200 h-full flex flex-col justify-end">
                                    <p className="font-bold text-slate-800 text-sm truncate w-full">{users[1].name}</p>
                                    <p className="text-slate-500 text-xs">{users[1].points} pts</p>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div className="w-1/3 max-w-[160px] flex flex-col items-center z-10">
                                <div className="relative mb-3">
                                    <Crown className="w-8 h-8 text-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                                    {users[0].profilePhoto ?
                                        <img src={users[0].profilePhoto} className="w-20 h-20 rounded-full border-4 border-amber-300 shadow-lg" /> :
                                        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-2xl font-bold text-amber-500 border-4 border-amber-300 shadow-lg">{users[0].name[0]}</div>
                                    }
                                    <div className="absolute -bottom-2 translate-x-1/2 right-1/2 bg-amber-400 text-white border border-white text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">1</div>
                                </div>
                                <div className="text-center w-full bg-gradient-to-b from-amber-50 to-white rounded-t-xl p-4 border-t border-x border-amber-200 h-[110%] flex flex-col justify-end shadow-md">
                                    <p className="font-bold text-gray-900 text-base truncate w-full">{users[0].name}</p>
                                    <p className="text-amber-600 font-bold text-sm">{users[0].points} pts</p>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="w-1/3 max-w-[140px] flex flex-col items-center">
                                <div className="relative mb-3">
                                    {users[2].profilePhoto ?
                                        <img src={users[2].profilePhoto} className="w-16 h-16 rounded-full border-4 border-orange-200" /> :
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-xl font-bold text-orange-500 border-4 border-orange-200">{users[2].name[0]}</div>
                                    }
                                    <div className="absolute -bottom-2 translate-x-1/2 right-1/2 bg-orange-200 text-orange-700 border border-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">3</div>
                                </div>
                                <div className="text-center w-full bg-orange-50 rounded-t-xl p-3 border-t border-x border-orange-200 h-2/3 flex flex-col justify-end">
                                    <p className="font-bold text-orange-800 text-sm truncate w-full">{users[2].name}</p>
                                    <p className="text-orange-600/70 text-xs">{users[2].points} pts</p>
                                </div>
                            </div>
                        </div>
                    )} {/* End Podium */}

                    <div className="space-y-3 px-4">
                        {users.map((user, index) => (
                            (users.length < 3 || index >= 3) && (
                                <div key={user.id} className={`flex items-center p-4 rounded-xl border transition-all hover:scale-[1.01] ${getRankStyle(index)} ${currentUser?.uid === user.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                                >
                                    <div className="w-8 flex justify-center mr-4">
                                        {getRankIcon(index)}
                                    </div>

                                    <div className="flex-shrink-0 mr-4">
                                        {user.profilePhoto ? (
                                            <img className="h-10 w-10 rounded-full object-cover" src={user.profilePhoto} alt="" />
                                        ) : (
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${index < 3 ? 'bg-gray-400' : 'bg-emerald-400'}`}>
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
                                        {user.role === 'admin' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Admin</span>}
                                        {user.role === 'checker' && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Checker</span>}
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-bold text-emerald-600">{user.points}</p>
                                        <p className="text-xs text-gray-400">pts</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </>
            ) : (
                /* Communities List */
                <div className="space-y-4 px-4">
                    {communities.map((comm, index) => (
                        <div key={comm.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center hover:shadow-md transition-all">
                            <div className="mr-5 text-xl font-bold text-gray-400 w-6 text-center">#{index + 1}</div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-4">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{comm.name}</h3>
                                <p className="text-sm text-gray-500">Leader: <span className="text-amber-600 font-medium">{comm.leaderName || 'None'}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-emerald-600">{comm.communityPoints || 0}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Score</p>
                            </div>
                        </div>
                    ))}
                    {communities.length === 0 && (
                        <div className="text-center py-10 text-gray-500">No communities ranked yet. Start planting!</div>
                    )}
                </div>
            )}

            {/* Sticky "Your Rank" Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40 md:hidden">
                <div className="flex items-center justify-between max-w-sm mx-auto">
                    <span className="text-sm font-medium text-gray-500">Your Rank: <span className="text-gray-900 font-bold">#42</span></span>
                    <span className="text-sm font-medium text-gray-500">Keep growing! 🌱</span>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
