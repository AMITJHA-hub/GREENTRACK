import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';

export const LEVEL_CONFIG = {
    BASE_XP: 100, // XP needed for first level
    MULTIPLIER: 1 // Next levels need: level * 100
};

export const BADGES = {
    FIRST_SPROUT: { id: 'first_sprout', name: 'First Sprout', icon: '🌱', description: 'Planted your first tree' },
    TREE_GUARDIAN: { id: 'tree_guardian', name: 'Tree Guardian', icon: '🌳', description: 'Verified 10 updates' },
    TOP_PERFORMER: { id: 'top_performer', name: 'Top Performer', icon: '🏆', description: 'Reached top 10% of leaderboard' }
};

export const POINTS = {
    REGISTER_TREE: 20,
    CREATE_POST: 5,
    VERIFIED_POST: 10,
    LIKE_RECEIVED: 1
};

/**
 * Award points to a user and handle leveling up transactionally.
 * @param {string} userId - The user's ID
 * @param {number} amount - Points to add
 * @param {object} context - Optional context { action: 'REGISTER_TREE' | 'VERIFIED_POST' }
 */
export const awardPoints = async (userId, amount, context = {}) => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) return; // Should not happen if AuthContext ensures doc creation

            const userData = userDoc.data();
            let { points = 0, xp = 0, level = 1, badges = [] } = userData;

            // 1. Update Points & XP
            points += amount;
            xp += amount;

            // 2. Level Up Logic
            const requiredXP = level * 100;
            if (xp >= requiredXP) {
                level++;
                xp -= requiredXP;
                // In a real app, you might trigger a 'Level Up' notification here
            }

            const updates = { points, xp, level };

            // 3. Badge Logic
            if (context.action === 'REGISTER_TREE') {
                if (!badges.includes(BADGES.FIRST_SPROUT.id)) {
                    badges.push(BADGES.FIRST_SPROUT.id);
                    updates.badges = badges;
                }
                // Also increment tree count if passed in context, but usually better handled by the specific action
            }

            transaction.update(userRef, updates);
        });
        console.log(`Awarded ${amount} points to ${userId}`);

        // 4. Trigger Leader Check (Async - Fire and Forget)
        checkCommunityLeader(userId).catch(err => console.error("Leader check failed:", err));

    } catch (error) {
        console.error("Error awarding points:", error);
    }
};

/**
 * Checks if the user is now the new Community Leader.
 * This runs outside the main transaction to prevent contention/slowdown.
 */
export const checkCommunityLeader = async (userId) => {
    try {
        const { collection, query, where, orderBy, limit, getDocs, doc, writeBatch, getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(doc(db, "users", userId));

        if (!userDoc.exists()) return;
        const userData = userDoc.data();
        const communityId = userData.communityId;

        if (!communityId || communityId === 'global') return; // simplified for MVP

        // Find current max in this community
        const investorsRef = collection(db, "users");
        const q = query(
            investorsRef,
            where("communityId", "==", communityId),
            orderBy("points", "desc"),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const newLeaderDoc = snapshot.docs[0];
        const newLeaderData = newLeaderDoc.data();
        const newLeaderId = newLeaderDoc.id;

        // Get Community Doc
        const communityRef = doc(db, "communities", communityId);
        const communityDoc = await getDoc(communityRef);
        const currentLeaderId = communityDoc.exists() ? communityDoc.data().leaderId : null;

        // If leader changed or community doc doesn't exist yet
        if (newLeaderId !== currentLeaderId) {
            console.log(`👑 New Community Leader for ${communityId}: ${newLeaderData.name}`);

            const batch = writeBatch(db);

            // 1. Update Community Doc
            batch.set(communityRef, {
                id: communityId,
                name: userData.communityName || 'Community',
                leaderId: newLeaderId,
                leaderName: newLeaderData.name,
                leaderPhoto: newLeaderData.photoURL,
                leaderPoints: newLeaderData.points,
                updatedAt: new Date()
            }, { merge: true });

            // 2. Update New Leader User Doc
            batch.update(doc(db, "users", newLeaderId), { isCommunityLeader: true });

            // 3. Demote Old Leader (if exists)
            if (currentLeaderId && currentLeaderId !== newLeaderId) {
                batch.update(doc(db, "users", currentLeaderId), { isCommunityLeader: false });
            }

            await batch.commit();
        } else {
            // Update points if same leader
            /* Optional optimization: only update if points changed significantly */
            const batch = writeBatch(db);
            batch.update(communityRef, { leaderPoints: newLeaderData.points });
            await batch.commit();
        }

    } catch (error) {
        console.error("Error in checkCommunityLeader:", error);
    }
};
