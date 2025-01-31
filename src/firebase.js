import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

import { getAnalytics } from "firebase/analytics";



const firebaseConfig = {
    apiKey: "AIzaSyDQLn3_Ja1RBsMKA9C3PrfOtM0PsIpeKI8",
    authDomain: "task-management-applicat-ba7b6.firebaseapp.com",
    projectId: "task-management-applicat-ba7b6",
    storageBucket: "task-management-applicat-ba7b6.appspot.com",
    messagingSenderId: "90425789598",
    appId: "1:90425789598:web:617d52860b4b7112abbf8f",
    measurementId: "G-XXQV6GTD03"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app); 


const analytics = getAnalytics(app);
export { storage };