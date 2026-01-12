import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, CheckCircle2, Clock, ThumbsUp, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const PostCard = ({ post }) => {
    const { currentUser } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.upvotesCount || 0);

    // Check if user already liked this post
    React.useEffect(() => {
        if (currentUser && post.id) {
            const checkLike = async () => {
                const { doc, getDoc } = await import('firebase/firestore');
                const likeRef = doc(db, "posts", post.id, "likes", currentUser.uid);
                const snap = await getDoc(likeRef);
                if (snap.exists()) setIsLiked(true);
            };
            checkLike();
        }
    }, [currentUser, post.id]);

    const handleLike = async () => {
        if (isLiked) return; // Prevent spamming for MVP

        setIsLiked(true);
        setLikeCount(prev => prev + 1);

        try {
            const { updateDoc, increment } = await import('firebase/firestore');
            const postRef = doc(db, "posts", post.id);

            // 1. Update Post Count
            await updateDoc(postRef, {
                upvotesCount: increment(1)
            });

            // 2. Award Point to Author
            if (post.userId) {
                const { awardPoints, POINTS } = await import('../utils/gamification');
                await awardPoints(post.userId, POINTS.LIKE_RECEIVED, { action: 'LIKE_RECEIVED' });
            }
        } catch (error) {
            console.error("Error liking post:", error);
            // Revert on error
            setIsLiked(false);
            setLikeCount(prev => prev - 1);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deleteDoc(doc(db, "posts", post.id));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post");
            }
        }
    };

    const handleVerify = async () => {
        if (window.confirm("Verify this post? This will award points to the user.")) {
            try {
                const { updateDoc } = await import('firebase/firestore');
                const postRef = doc(db, "posts", post.id);

                await updateDoc(postRef, {
                    status: 'verified'
                });

                // Award Points for Verification
                if (post.userId) {
                    const { awardPoints, POINTS } = await import('../utils/gamification');
                    await awardPoints(post.userId, POINTS.VERIFIED_POST, { action: 'VERIFIED_POST' });
                }
            } catch (error) {
                console.error("Error verifying post:", error);
            }
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                        {post.userPhoto ? (
                            <img src={post.userPhoto} alt={post.userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-white">
                                {post.userName?.charAt(0)}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {post.userName}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center">
                            {post.createdAt?.seconds ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                            <span className="mx-1">•</span>
                            <span className="flex items-center text-emerald-600 font-medium">
                                Level 1
                            </span>
                        </p>
                    </div>
                </div>
                {currentUser && currentUser.uid === post.userId ? (
                    <button
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                        title="Delete Post"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                ) : (
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                )}

                {/* Dev/Admin Tool: Verify Button */}
                {post.status === 'pending' && (
                    <button
                        onClick={handleVerify}
                        className="ml-2 text-amber-500 hover:text-emerald-600 p-2 rounded-full hover:bg-emerald-50 transition border border-amber-200"
                        title="Verify this post (Admin)"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Image Section - Only render if imageUrl exists */}
            {post.imageUrl && (
                <div className="relative aspect-[4/3] bg-gray-100 group">
                    <img src={post.imageUrl} alt="Care proof" className="w-full h-full object-cover" />

                    {/* Status Overlay */}
                    <div className="absolute top-4 right-4">
                        {post.status === 'verified' && (
                            <div className="flex items-center px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 animate-fade-in">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                Verified
                            </div>
                        )}
                        {post.status === 'pending' && (
                            <div className="flex items-center px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-amber-600 shadow-sm ring-1 ring-amber-500/20">
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                Pending
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Status for Text-Only Posts */}
            {!post.imageUrl && (
                <div className="px-4 pt-4 flex justify-end">
                    {post.status === 'verified' && (
                        <div className="flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            Verified
                        </div>
                    )}
                    {post.status === 'pending' && (
                        <div className="flex items-center px-3 py-1.5 rounded-full bg-amber-50 text-xs font-bold text-amber-600">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            Pending
                        </div>
                    )}
                </div>
            )}

            {/* Content & Engagement */}
            <div className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors ${isLiked ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{likeCount}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>0</span>
                    </button>
                </div>

                <div className="mb-3">
                    <p className="text-gray-800 leading-relaxed text-sm">
                        <span className="font-semibold text-gray-900 mr-2">{post.userName}</span>
                        {post.caption}
                    </p>
                </div>

                <div className="flex items-center text-xs font-medium text-gray-400 pt-2 border-t border-gray-50">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    {post.location?.lat && post.location?.lng ?
                        `Location: ${post.location.lat.toFixed(4)}, ${post.location.lng.toFixed(4)}` :
                        'Location hidden'
                    }
                </div>
            </div>
        </div>
    );
};

export default PostCard;
