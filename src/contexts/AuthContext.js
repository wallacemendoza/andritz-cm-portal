import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with email and password
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('User not authorized');
    }
    return userCredential;
  }

  // Sign out
  function logout() {
    return signOut(auth);
  }

  // Create a new user (admin only)
  async function createUser(email, role = 'user') {
    // Create a temporary password that will be sent via email
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    
    // Store user data in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      role: role,
      createdAt: new Date().toISOString(),
      needsPasswordReset: true
    });

    // Send password reset email
    await sendPasswordResetEmail(auth, email);

    return userCredential.user;
  }

  // Get all users (admin only)
  async function getAllUsers() {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Delete user (admin only)
  async function deleteUser(userId) {
    await deleteDoc(doc(db, 'users', userId));
  }

  // Update user role (admin only)
  async function updateUserRole(userId, newRole) {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole
    });
  }

  // Check if user is admin
  function isAdmin() {
    return userRole === 'admin';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    createUser,
    getAllUsers,
    deleteUser,
    updateUserRole,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
