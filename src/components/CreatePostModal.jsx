import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { X, Camera, MapPin, Loader } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [caption, setCaption] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trees, setTrees] = useState([]);
    const [selectedTreeId, setSelectedTreeId] = useState('');

    // Fetch trees for dropdown
    useEffect(() => {
        if (currentUser && isOpen) {
            const q = query(collection(db, "trees"), where("caretakerId", "==", currentUser.uid));
            getDocs(q).then(snap => {
                setTrees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }
    }, [currentUser, isOpen]);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                console.error("Error getting location", error);
                alert("Location access denied or failed.");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const [uploadError, setUploadError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location) {
            alert("Location is required!");
            return;
        }

        setLoading(true);
        setUploadError(null);

        try {
            let imageUrl = "https://placehold.co/600x400?text=Tree+Care+Update";

            // If user selected an image, try to upload it
            if (imageFile) {
                try {
                    console.log("Starting image upload...");
                    const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`);

                    // 15 seconds timeout
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Upload timed out")), 15000)
                    );

                    await Promise.race([
                        uploadBytes(storageRef, imageFile),
                        timeoutPromise
                    ]);

                    imageUrl = await getDownloadURL(storageRef);
                } catch (error) {
                    console.error("Upload failed:", error);
                    setLoading(false);
                    // Show specific error to help user debug (e.g. 'storage/unauthorized')
                    setUploadError(`Upload failed: ${error.code || error.message}`);
                    return;
                }
            }

            // Create Post in Firestore
            await createPostRecord(imageUrl);

        } catch (error) {
            console.error("Error creating post", error);
            alert("Failed to create post: " + error.message);
            setLoading(false);
        }
    };

    const createPostRecord = async (imageUrl) => {
        // Get user community
        let communityId = 'global';
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists() && userDoc.data().communityId) {
                communityId = userDoc.data().communityId;
            }
        } catch (e) {
            console.error("Error getting user community for post:", e);
        }

        await addDoc(collection(db, "posts"), {
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userPhoto: currentUser.photoURL,
            treeId: selectedTreeId,
            caption: caption,
            imageUrl: imageUrl,
            hasImage: !!imageUrl, // Explicit flag as requested
            communityId: communityId, // Tagging with Community
            location: location,
            createdAt: serverTimestamp(),
            status: 'verified', // Auto-verify 
            upvotesCount: 0
        });

        // Gamification
        try {
            const { awardPoints, POINTS } = await import('../utils/gamification');
            await awardPoints(currentUser.uid, POINTS.CREATE_POST, { action: 'CREATE_POST' });
        } catch (err) {
            console.error(err);
        }

        resetForm();
    };

    const handleSkipImage = () => {
        setLoading(true);
        // Pass null so the PostCard knows not to render any image section
        createPostRecord(null);
    };

    const resetForm = () => {
        setCaption('');
        setImageFile(null);
        setLocation(null);
        setSelectedTreeId('');
        setLoading(false);
        setUploadError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">New Tree Care Post</h2>
                    <button onClick={onClose}><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tree Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Tree</label>
                        <select
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                            value={selectedTreeId}
                            onChange={(e) => setSelectedTreeId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose a Tree --</option>
                            {trees.map(t => <option key={t.id} value={t.id}>{t.species}</option>)}
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Photo Proof</label>
                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100" />
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Caption</label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                            rows="3"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {/* Location */}
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-sm text-gray-600">
                            {location ? `Loc: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Location required"}
                        </span>
                        <button type="button" onClick={getLocation} className="text-green-600 text-sm font-medium flex items-center hover:underline">
                            <MapPin className="w-4 h-4 mr-1" /> Get Location
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 flex justify-center"
                    >
                        {loading ? <Loader className="animate-spin" /> : "Post Update"}
                    </button>

                    {uploadError && (
                        <div className="mt-2 p-3 bg-red-50 text-red-700 rounded text-sm text-center animate-fade-in">
                            <p className="font-bold mb-2">{uploadError}</p>
                            <div className="flex justify-center space-x-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-3 py-1 bg-white border border-red-200 rounded hover:bg-red-50"
                                >
                                    Retry
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSkipImage}
                                    className="px-3 py-1 bg-red-100 rounded hover:bg-red-200"
                                >
                                    Post without Image
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
