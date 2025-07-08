// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, collectionGroup, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // NEW: Import Storage functions

// Declare global variables provided by the Canvas environment
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

let firebaseAppInstance: any;
let authInstance: any;
let dbInstance: any;
let storageInstance: any; // NEW: Storage instance

let isFirebaseInitialized = false;

// Your web app's Firebase configuration (provided by user)
const firebaseConfig = {
  apiKey: "AIzaSyAjXE4BiSqlwtvUbI1Mv8_0zK8r4HyG7c0",
  authDomain: "pam10-5be48.firebaseapp.com",
  projectId: "pam10-5be48", // THIS IS YOUR PROJECT ID
  storageBucket: "pam10-5be48.firebasestorage.app", // Ensure this is correct
  messagingSenderId: "57290618863",
  appId: "1:57290618863:web:cbe526da6eb1471283e81a",
  measurementId: "G-24EVR4676C"
};

// Function to initialize Firebase and handle initial authentication
export const initializeFirebase = async () => { // Exported for external use
    if (isFirebaseInitialized) {
        return { app: firebaseAppInstance, authInstance: authInstance, dbInstance: dbInstance, storageInstance: storageInstance };
    }

    try {
        firebaseAppInstance = initializeApp(firebaseConfig);
        authInstance = getAuth(firebaseAppInstance);
        dbInstance = getFirestore(firebaseAppInstance);
        storageInstance = getStorage(firebaseAppInstance); // NEW: Initialize Storage
        isFirebaseInitialized = true;
        console.log("Firebase initialized successfully.");

        // Attempt to sign in with custom token provided by Canvas
        if (typeof __initial_auth_token !== 'undefined') {
            try {
                await signInWithCustomToken(authInstance, __initial_auth_token);
                console.log("Signed in with custom token (Canvas environment).");
            } catch (error: any) {
                console.error("Error signing in with custom token:", error.message);
                try {
                    await signInAnonymously(authInstance);
                    console.log("Signed in anonymously due to custom token failure.");
                } catch (anonError: any) {
                    console.error("Error signing in anonymously after custom token failure:", anonError.message);
                    if (anonError.code === 'auth/admin-restricted-operation') {
                        console.warn("Anonymous sign-in restricted by admin configuration. Proceeding without immediate authentication.");
                    }
                }
            }
        } else {
            // If no custom token, try to sign in anonymously for basic access
            try {
                await signInAnonymously(authInstance);
                console.log("Signed in anonymously (no custom token provided).");
            } catch (anonError: any) {
                console.error("Error signing in anonymously (no custom token):", anonError.message);
                if (anonError.code === 'auth/admin-restricted-operation') {
                    console.warn("Anonymous sign-in restricted by admin configuration. Proceeding without immediate authentication.");
                }
            }
        }

        return { app: firebaseAppInstance, authInstance: authInstance, dbInstance: dbInstance, storageInstance: storageInstance };

    } catch (error: any) {
        console.error("Failed to initialize Firebase core services:", error.message);
        isFirebaseInitialized = true;
        authInstance = null;
        dbInstance = null;
        storageInstance = null; // Ensure storage is null on failure
        return { app: null, authInstance: null, dbInstance: null, storageInstance: null };
    }
};

// Export functions to get auth and db instances
export const getFirebaseAuth = () => authInstance;
export const getFirebaseDb = () => dbInstance;
export const getFirebaseStorage = () => storageInstance; // NEW: Export getFirebaseStorage
export const initFirebase = initializeFirebase; // Renamed export for consistency

// Helper to get current user ID or generate a random one for unauthenticated users
export const getCurrentUserId = (user: FirebaseUser | null): string => {
    // Use __app_id if available, otherwise fallback to firebaseConfig.projectId
    const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
    return user?.uid || `${appId}-anon-${crypto.randomUUID()}`;
};

// Helper to get the current user object
export const getUser = (): FirebaseUser | null => {
    return authInstance?.currentUser || null;
};

// Function to save user profile to Firestore
export const saveUserProfile = async (userId: string, profileData: any) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot save user profile.");
        return;
    }

    const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
    const userProfileRef = doc(dbInstance, `artifacts/${appId}/users/${userId}/profiles`, 'userProfile');

    try {
        await setDoc(userProfileRef, profileData, { merge: true });
        console.log(`User profile for ${userId} saved/updated successfully.`);
    } catch (error) {
        console.error("Error saving user profile to Firestore:", error);
        throw new Error("Failed to save user profile.");
    }
};

// Function to get user profile from Firestore
export const getUserProfile = async (userId: string) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot get user profile.");
        return null;
    }

    const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
    const userProfileRef = doc(dbInstance, `artifacts/${appId}/users/${userId}/profiles`, 'userProfile');

    try {
        const docSnap = await getDoc(userProfileRef);
        if (docSnap.exists()) {
            console.log(`User profile for ${userId} loaded successfully.`);
            return docSnap.data();
        } else {
            console.log(`No user profile found for ${userId}.`);
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile from Firestore:", error);
        return null;
    }
};

// --- Firestore Functions for Job Requisitions (SIMPLIFIED) ---
const getJobsCollectionRef = () => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot get jobs collection reference.");
        throw new Error("Firestore database not initialized.");
    }
    const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
    return collection(dbInstance, `artifacts/${appId}/public/data/jobs`);
};

export const addJob = async (jobData: any) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot add job.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const jobsCollectionRef = getJobsCollectionRef();
        const docRef = await addDoc(jobsCollectionRef, {
            ...jobData,
            postedAt: new Date().toISOString(),
            status: jobData.status || 'Draft'
        });
        console.log("Job added with ID: ", docRef.id, " to collection: ", jobsCollectionRef.path);
        return { id: docRef.id, ...jobData, status: jobData.status || 'Draft' };
    } catch (error) {
        console.error("Error adding job: ", error);
        throw new Error(`Failed to add job: ${error.message}`); // Enhanced error message
    }
};

export const getJob = async (jobId: string) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot get job.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const jobDocRef = doc(getJobsCollectionRef(), jobId);
        const docSnap = await getDoc(jobDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting job: ", error);
        throw new Error(`Failed to retrieve job: ${error.message}`); // Enhanced error message
    }
};

export const updateJob = async (jobId: string, updatedData: any) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot update job.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const jobDocRef = doc(getJobsCollectionRef(), jobId);
        await updateDoc(jobDocRef, updatedData);
        console.log("Job updated successfully in place: ", jobId, " in collection: ", getJobsCollectionRef().path);
        return { id: jobId, ...updatedData, status: updatedData.status || 'Draft' };
    } catch (error) {
        console.error("Error updating job: ", error);
        throw new Error(`Failed to update job: ${error.message}`); // Enhanced error message
    }
};

export const deleteJob = async (jobId: string) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot delete job.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const jobDocRef = doc(getJobsCollectionRef(), jobId);
        await deleteDoc(jobDocRef);
        console.log("Job deleted successfully: ", jobId, " from collection: ", jobDocRef.path);
    } catch (error) {
        console.error("Error deleting job: ", error);
        throw new Error(`Failed to delete job: ${error.message}`); // Enhanced error message
    }
};


export const getAllJobsForRecruiter = async (recruiterId: string) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot get all jobs for recruiter.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const jobsCollectionRef = getJobsCollectionRef();
        const q = query(jobsCollectionRef, where("recruiterId", "==", recruiterId), orderBy("postedAt", "asc"));
        const querySnapshot = await getDocs(q);
        const jobs: any[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`Retrieved ${jobs.length} total jobs for recruiter ${recruiterId} from public collection.`);
        return jobs;
    } catch (error) {
        console.error("Error getting all jobs for recruiter: ", error);
        throw new Error(`Failed to retrieve jobs for recruiter: ${error.message}`); // Enhanced error message
    }
};

export const getAllPublicJobs = async () => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot get all public jobs.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const publicJobsCollectionRef = getJobsCollectionRef();
        const q = query(publicJobsCollectionRef, where("status", "==", "Published"), orderBy("postedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobs: any[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Retrieved ${jobs.length} public (published) jobs.`);
        return jobs;
    } catch (error) {
        console.error("Error getting all public jobs: ", error);
        throw new Error(`Failed to retrieve public jobs: ${error.message}`); // Enhanced error message
    }
};

// --- NEW: Firestore Functions for Applications ---
export const addJobApplication = async (applicationData: any) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot add job application.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        // Applications are stored per user in their private collection
        const applicationsCollectionRef = collection(dbInstance, `artifacts/${appId}/users/${applicationData.applicantId}/applications`);
        const docRef = await addDoc(applicationsCollectionRef, applicationData);
        console.log("Job application added with ID: ", docRef.id, " to collection: ", applicationsCollectionRef.path);
        return { id: docRef.id, ...applicationData };
    } catch (error) {
        console.error("Error adding job application: ", error);
        throw new Error(`Failed to add job application: ${error.message}`);
    }
};

export const updateJobApplication = async (applicantId: string, applicationId: string, updatedData: any) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot update job application.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        const applicationDocRef = doc(dbInstance, `artifacts/${appId}/users/${applicantId}/applications`, applicationId);
        await updateDoc(applicationDocRef, updatedData);
        console.log("Job application updated successfully: ", applicationId);
        return { id: applicationId, ...updatedData };
    } catch (error) {
        console.error("Error updating job application: ", error);
        throw new Error(`Failed to update job application: ${error.message}`);
    }
};

export const getJobApplicationByJobAndApplicant = async (jobId: string, applicantId: string) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot get job application.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        const applicationsCollectionRef = collection(dbInstance, `artifacts/${appId}/users/${applicantId}/applications`);
        const q = query(applicationsCollectionRef, where("jobId", "==", jobId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting job application by job and applicant: ", error);
        throw new Error(`Failed to retrieve job application: ${error.message}`);
    }
};


export const getAllApplicationsForRecruiter = async (recruiterId: string) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot get applications for recruiter.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        // Step 1: Get all job IDs posted by this recruiter
        const jobsCollectionRef = getJobsCollectionRef(); // Uses public jobs collection
        const qRecruiterJobs = query(jobsCollectionRef, where("recruiterId", "==", recruiterId));
        const jobSnapshot = await getDocs(qRecruiterJobs);
        const recruiterJobIds = jobSnapshot.docs.map(doc => doc.id);

        if (recruiterJobIds.length === 0) {
            console.log("No jobs found for this recruiter, so no applications to retrieve.");
            return [];
        }

        // Step 2: Query applications collection group where jobId is one of the recruiter's job IDs
        // Firestore 'in' query operator has a limit of 10 items.
        // If a recruiter has more than 10 jobs, this needs to be split into multiple queries.
        let allApplications: any[] = [];
        const batchSize = 10;
        for (let i = 0; i < recruiterJobIds.length; i += batchSize) {
            const batchJobIds = recruiterJobIds.slice(i, i + batchSize);
            const applicationsCollectionGroupRef = collectionGroup(dbInstance, 'applications'); // Correctly calls collectionGroup
            const qApplications = query(
                applicationsCollectionGroupRef,
                where('jobId', 'in', batchJobIds),
                orderBy('submittedAt', 'desc') // Order by latest submission
            );
            const appSnapshot = await getDocs(qApplications);
            appSnapshot.docs.forEach(doc => {
                allApplications.push({ id: doc.id, ...doc.data() });
            });
        }

        console.log(`Retrieved ${allApplications.length} applications for recruiter ${recruiterId}.`);
        return allApplications;

    } catch (error) {
        console.error("Error getting all applications for recruiter: ", error);
        throw new Error(`Failed to retrieve applications for recruiter: ${error.message}`);
    }
};

// --- NEW: Firebase Storage Functions ---
export const uploadFileToStorage = async (file: File | Blob, path: string): Promise<string> => {
    if (!storageInstance) {
        console.error("Firebase Storage instance is null. Cannot upload file.");
        throw new Error("Firebase Storage not initialized.");
    }
    try {
        const storageRef = ref(storageInstance, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`File uploaded to: ${downloadURL}`);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file to storage:", error);
        throw new Error(`Failed to upload file to storage: ${error.message}`);
    }
};

export const deleteFileFromStorage = async (url: string): Promise<void> => {
    if (!storageInstance) {
        console.error("Firebase Storage instance is null. Cannot delete file.");
        return;
    }
    try {
        const fileRef = ref(storageInstance, url); // Get ref from URL
        await deleteObject(fileRef);
        console.log(`File deleted from storage: ${url}`);
    } catch (error) {
        console.error("Error deleting file from storage:", error);
        throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
};

// --- NEW: Function to update application status ---
export const updateApplicationStatus = async (applicantId: string, appId: string, newStatus: string) => {
    if (!dbInstance) {
        console.error("Firestore database instance is null. Cannot update application status.");
        throw new Error("Firestore database not initialized.");
    }
    try {
        // Correct path for application document: artifacts/{appId}/users/{applicantId}/applications/{applicationId}
        const applicationDocRef = doc(dbInstance, `artifacts/${getAppId()}/users/${applicantId}/applications/${appId}`); // Fix: Use appId as the document ID here
        await updateDoc(applicationDocRef, { status: newStatus });
        console.log(`Application ${appId} status updated to ${newStatus}.`);
    } catch (error) {
        console.error("Error updating application status:", error);
        throw new Error(`Failed to update application status: ${error.message}`);
    }
};

