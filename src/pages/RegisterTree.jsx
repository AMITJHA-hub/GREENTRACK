import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, TreeDeciduous, MapPin, Calendar, Sprout } from 'lucide-react';

const RegisterTree = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        species: '',
        plantedDate: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "trees"), {
                ...formData,
                caretakerId: currentUser.uid,
                healthScore: 100, // Initial score
                createdAt: serverTimestamp()
            });

            // Gamification: Award Points for Planting
            try {
                const { awardPoints, POINTS } = await import('../utils/gamification');
                await awardPoints(currentUser.uid, POINTS.REGISTER_TREE, { action: 'REGISTER_TREE' });
            } catch (err) {
                console.error("Failed to award points:", err);
            }

            navigate('/trees');
        } catch (error) {
            console.error("Error registering tree:", error);
            alert("Failed to register tree: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-slide-up">
            <button
                onClick={() => navigate('/trees')}
                className="mb-6 flex items-center text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Forest
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Sprout className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Register a New Tree</h1>
                    <p className="text-emerald-100 mt-2 text-sm">Every tree counts! Enter the details below.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tree Species</label>
                        <div className="relative">
                            <TreeDeciduous className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                className="pl-10 w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                placeholder="e.g. Mango, Neem, Oak"
                                value={formData.species}
                                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date Planted</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                required
                                className="pl-10 w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                value={formData.plantedDate}
                                onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location Description</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                className="pl-10 w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                placeholder="e.g. Central Park, near the fountain"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Planting...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterTree;
