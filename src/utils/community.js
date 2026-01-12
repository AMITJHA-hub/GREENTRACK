import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Mock database of communities for this hackathon/MVP
// In a real app, this would be a Firestore collection we query geospatially
export const COMMUNITIES = [
    { id: 'mumbai', name: 'Mumbai Community', type: 'city', lat: 19.0760, lng: 72.8777 },
    { id: 'delhi', name: 'Delhi Community', type: 'city', lat: 28.7041, lng: 77.1025 },
    { id: 'bengaluru', name: 'Bengaluru Community', type: 'city', lat: 12.9716, lng: 77.5946 },
    { id: 'chennai', name: 'Chennai Community', type: 'city', lat: 13.0827, lng: 80.2707 },
    { id: 'kolkata', name: 'Kolkata Community', type: 'city', lat: 22.5726, lng: 88.3639 },
    { id: 'global', name: 'Global Earth Guardians', type: 'global', lat: 0, lng: 0 } // Fallback
];

/**
 * Calculate distance between two points in km (Haversine formula)
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Get user's current position
 */
export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        }
    });
};

/**
 * Determine the closest community based on lat/lng
 */
export const findNearestCommunity = (lat, lng) => {
    let closest = COMMUNITIES.find(c => c.id === 'global');
    let minDistance = Infinity;

    // Threshold for being "in" a city community (e.g., 50km radius)
    const MAX_DISTANCE_KM = 50;

    COMMUNITIES.forEach(community => {
        if (community.type === 'global') return;

        const dist = getDistanceFromLatLonInKm(lat, lng, community.lat, community.lng);
        if (dist < minDistance && dist <= MAX_DISTANCE_KM) {
            minDistance = dist;
            closest = community;
        }
    });

    return closest;
};

/**
 * Assign a community to a user.
 * If location is provided, calculates nearest.
 * If not, assigns Global.
 */
export const assignUserCommunity = async (userId, location = null) => {
    try {
        let community = COMMUNITIES.find(c => c.id === 'global');

        if (location) {
            community = findNearestCommunity(location.lat, location.lng);
        }

        const userRef = doc(db, "users", userId);

        // We only update the community fields, preserving other data
        await setDoc(userRef, {
            communityId: community.id,
            communityName: community.name,
            lastLocation: location // Optional: store where they were last seen
        }, { merge: true });

        return community;
    } catch (error) {
        console.error("Error assigning community:", error);
        return null;
    }
};
