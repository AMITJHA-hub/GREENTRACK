import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Users, MapPin, Globe } from 'lucide-react';

const Community = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [communityInfo, setCommunityInfo] = useState({ id: 'global', name: 'Global Community' });

    // Fetch User's Community Info
    useEffect(() => {
        if (!currentUser) return;

        const fetchCommunity = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.communityId) {
                        setCommunityInfo({
                            id: data.communityId,
                            name: data.communityName || 'My Community'
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching community info:", err);
            }
        };

        fetchCommunity();
    }, [currentUser]);

    // Fetch Community Posts
    useEffect(() => {
        if (!communityInfo.id) return;

        const postsRef = collection(db, "posts");
        // Query: where communityId == current user's community
        const q = query(
            postsRef,
            where("communityId", "==", communityInfo.id),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching community posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [communityInfo.id]);

    // Listen to Community Leader Updates & Score
    useEffect(() => {
        if (!communityInfo.id) return;

        const communityRef = doc(db, "communities", communityInfo.id);

        const unsubscribeCommunity = onSnapshot(communityRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // We're skipping the rank calculation for now to keep it simple and avoid errors
                // In a real app, this would be computed by a cloud function

                setCommunityInfo(prev => ({
                    ...prev,
                    leaderName: data.leaderName,
                    leaderPhoto: data.leaderPhoto,
                    leaderPoints: data.leaderLocalPoints || data.leaderPoints,
                    communityPoints: data.communityPoints || 0,
                    // rank: rank 
                }));
            }
        });
        return () => unsubscribeCommunity();
    }, [communityInfo.id]);

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Community Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 mb-8 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="relative z-10 text-center">
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        {communityInfo.type === 'global' ? <Globe className="w-8 h-8" /> : <MapPin className="w-8 h-8" />}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{communityInfo.name}</h1>
                    <p className="text-emerald-600 font-medium flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        {posts.length > 0 ? `${posts.length} Active Posts` : 'Growing Community'}
                    </p>
                    <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                        Connect with fellow Tree Guardians in your area. Share updates, organize drives, and grow your local forest!
                    </p>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="flex justify-between items-center mb-6 sticky top-20 z-40 py-4 bg-slate-50/95 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-gray-800">Local Updates</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center font-medium">
                    + Share Update
                </button>
            </div>

            {/* Posts Feed */}
            <div className="space-y-8 animate-slide-up">
                {loading ? (
                    [1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl h-64 animate-pulse shadow-sm border border-gray-100"></div>
                    ))
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">It's quiet here...</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2">
                            Be the first to post in the {communityInfo.name}! Plant a tree or share a local update.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 text-emerald-600 font-bold hover:underline"
                        >
                            Create First Post
                        </button>
                    </div>
                )}
            </div>

            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Community;
