import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Monitor auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if user doc exists
                const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('../firebase');
                const { assignUserCommunity, getUserLocation } = await import('../utils/community');

                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);

                if (!docSnap.exists()) {
                    // New User: Try to get location and assign community
                    let location = null;
                    try {
                        location = await getUserLocation();
                        console.log("Got user location:", location);
                    } catch (locError) {
                        console.warn("Location denied/failed, falling back to global:", locError);
                    }

                    const community = await assignUserCommunity(user.uid, location);

                    await setDoc(userRef, {
                        name: user.displayName || 'Anonymous',
                        email: user.email,
                        photoURL: user.photoURL,
                        points: 0,
                        level: 1,
                        xp: 0,
                        treesPlanted: 0,
                        verifiedPosts: 0,
                        role: 'user',
                        badges: [],
                        // Community Fields
                        communityId: community?.id || 'global',
                        communityName: community?.name || 'Global Earth Guardians',
                        createdAt: serverTimestamp()
                    });
                } else {
                    // Existing User: Check if they have a community assigned, if not update them
                    const userData = docSnap.data();
                    if (!userData.communityId) {
                        // Backfill community for existing users
                        let location = null;
                        try {
                            location = await getUserLocation();
                        } catch (e) { console.log('Location skip for backfill'); }

                        await assignUserCommunity(user.uid, location);
                    }
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
