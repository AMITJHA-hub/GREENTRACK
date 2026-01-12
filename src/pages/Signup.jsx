import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                profilePhoto: user.photoURL || "",
                joinedDate: serverTimestamp(),
                points: 0,
                badges: [],
                totalPosts: 0,
                role: "user"
            });

            navigate('/dashboard');
        } catch (err) {
            setError('Failed to create account: ' + err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Join GreenTrack</h2>
                {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700">
                        Sign Up
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-green-600 hover:underline">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
