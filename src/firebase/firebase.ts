// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBSkl5vg1LDrv686TR6wChw8rmcMh4_8Fg",
    authDomain: "agentify-de6b7.firebaseapp.com",
    projectId: "agentify-de6b7",
    storageBucket: "agentify-de6b7.appspot.com",
    messagingSenderId: "1075725796428",
    appId: "1:1075725796428:web:a0b0557459f536499c60e9",
    measurementId: "G-NCYCFRBJXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);