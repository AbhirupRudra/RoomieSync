// Standard npm imports for Firebase v9+ (Modular SDK)
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Your existing type imports
import { UserProfile, RequestStatus } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyAmX0AZXkWQFfRKxPLXnVuZg9m-YS3Jbxs",
  authDomain: "techsprint-33ce6.firebaseapp.com",
  projectId: "techsprint-33ce6",
  storageBucket: "techsprint-33ce6.firebasestorage.app",
  messagingSenderId: "765277979756",
  appId: "1:765277979756:web:9237e386faf727b1620449"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Added 'export' so other services can use it
const USERS_COLLECTION = "users";

export const saveUserProfile = async (profile: UserProfile) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, profile.id);
    await setDoc(userRef, profile, { merge: true });
    return true;
  } catch (e: any) {
    console.error("Error saving profile: ", e);
    throw e;
  }
};

export const initializeUserRecord = async (userId: string, email: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, { 
      id: userId, 
      email, 
      createdAt: new Date().toISOString(),
      sentRequests: [],
      acceptedRequests: [],
      rejectedRequests: []
    }, { merge: true });
    return true;
  } catch (e: any) {
    console.error("Error initializing user: ", e);
    throw e;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (e: any) {
    console.error("Error getting profile: ", e);
    throw e;
  }
};

export const fetchAllOtherUsers = async (currentUserId: string): Promise<UserProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserProfile;
      if (data.id !== currentUserId && data.name) {
        users.push(data);
      }
    });
    return users;
  } catch (e: any) {
    console.error("Error fetching users: ", e);
    return []; // Return empty instead of throwing to avoid dashboard crash
  }
};

/**
 * Only update the SENDER'S document.
 */
export const sendRoommateRequest = async (fromId: string, toId: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, fromId);
    await updateDoc(userRef, {
      sentRequests: arrayUnion(toId)
    });
    return true;
  } catch (e: any) {
    console.error("Error sending request: ", e);
    throw e;
  }
};

/**
 * Only update the CURRENT USER'S (receiver) document.
 */
export const updateRequestStatus = async (myId: string, targetId: string, status: RequestStatus) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, myId);
    if (status === RequestStatus.ACCEPTED) {
      await updateDoc(userRef, {
        acceptedRequests: arrayUnion(targetId),
        rejectedRequests: arrayRemove(targetId)
      });
    } else if (status === RequestStatus.REJECTED) {
      await updateDoc(userRef, {
        rejectedRequests: arrayUnion(targetId),
        acceptedRequests: arrayRemove(targetId)
      });
    }
    return true;
  } catch (e: any) {
    console.error("Error updating status: ", e);
    throw e;
  }
};

// Stubs for API compatibility
export const fetchIncomingRequests = async (userId: string) => [];
export const fetchOutgoingRequests = async (userId: string) => [];

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
