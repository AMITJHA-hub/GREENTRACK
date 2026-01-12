import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import PostCard from '../components/PostCard';

const TreeDetails = () => {
    const { id } = useParams();
    const [tree, setTree] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const treeDoc = await getDoc(doc(db, "trees", id));
                if (treeDoc.exists()) {
                    setTree({ id: treeDoc.id, ...treeDoc.data() });

                    // Fetch posts for this tree
                    // Note: This requires a composite index in Firestore (treeId + createdAt)
                    // If index fails, it will log an error with a link to create it.
                    const q = query(
                        collection(db, "posts"),
                        where("treeId", "==", id),
                        orderBy("createdAt", "desc")
                    );
                    const postsSnap = await getDocs(q);
                    setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            } catch (err) {
                console.error("Error fetching details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!tree) return <div className="p-8 text-center">Tree not found</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800">{tree.species}</h1>
                <p className="text-gray-500">Planted: {tree.plantedDate}</p>
                <p className="text-gray-500">Location: {tree.location}</p>
                <div className="mt-4 relative bg-gray-100 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                    <span className="text-gray-400">Map Preview Placeholder</span>
                    {/* Integrate Google Maps/Leaflet here if API key available */}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Care History</h2>
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
                {posts.length === 0 && <p className="text-gray-500 italic">No care updates posted yet.</p>}
            </div>
        </div>
    );
};
export default TreeDetails;
