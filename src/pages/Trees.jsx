import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, TreeDeciduous, MapPin, Calendar, ArrowRight, Activity } from 'lucide-react';

const Trees = () => {
    const { currentUser } = useAuth();
    const [trees, setTrees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrees = async () => {
            try {
                const q = query(collection(db, "trees"), where("caretakerId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const treesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTrees(treesData);
            } catch (error) {
                console.error("Error fetching trees:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) fetchTrees();
    }, [currentUser]);

    const HealthRing = ({ score }) => {
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        const color = score > 80 ? 'text-emerald-500' : score > 50 ? 'text-yellow-500' : 'text-red-500';

        return (
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={color}
                    />
                </svg>
                <span className="absolute text-[10px] font-bold text-gray-700">{score}%</span>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Forest</h1>
                    <p className="text-gray-500 mt-1">Manage and track the health of your planted trees.</p>
                </div>
                <Link to="/trees/new" className="hidden sm:flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-full font-medium shadow-lg hover:bg-emerald-700 transition transform hover:scale-105">
                    <Plus className="w-5 h-5 mr-2" />
                    Plant New Tree
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>
            ) : trees.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TreeDeciduous className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your forest is empty</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        Start your journey by registering your first tree. Track its growth and impact!
                    </p>
                    <Link to="/trees/new" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition">
                        Plant Your First Tree
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trees.map(tree => (
                        <div key={tree.id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <TreeDeciduous className="w-8 h-8 text-emerald-600" />
                                </div>
                                <HealthRing score={tree.healthScore || 100} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{tree.species}</h3>

                            <div className="space-y-2 mt-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    Planted: {tree.plantedDate}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="truncate">{tree.location}</span>
                                </div>
                                <div className="flex items-center pt-2">
                                    <Activity className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="text-emerald-600 font-medium">Healthy & Growing</span>
                                </div>
                            </div>

                            <Link to={`/trees/${tree.id}`} className="absolute inset-0" aria-label={`View details for ${tree.species}`}></Link>
                        </div>
                    ))}

                    {/* Floating FAB for mobile */}
                    <Link to="/trees/new" className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-emerald-700 transition-colors">
                        <Plus className="w-8 h-8" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Trees;
