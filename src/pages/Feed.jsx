import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Plus, Leaf } from 'lucide-react';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Feed error:", error);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8 sticky top-20 z-40 py-4 bg-slate-50/95 backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Community Gallery</h1>
                    <p className="text-sm text-gray-500">Inspiring tree care stories near you</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center font-medium"
                >
                    <Plus className="w-5 h-5 mr-1.5 group-hover:rotate-90 transition-transform" />
                    New Update
                </button>
            </div>

            <div className="space-y-8 animate-fade-in">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <Leaf className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Be the first to inspire!</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">
                            This feed looks a bit empty. Plant a tree or post an update to kickstart the community.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
                        >
                            Create a Post
                        </button>
                    </div>
                )}
            </div>

            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};
export default Feed;
