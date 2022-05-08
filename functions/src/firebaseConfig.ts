import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDc_ZlOSGx0_xTiFivvVKTpmQL_N2YOIu4",
  authDomain: "rubberducker-35ee3.firebaseapp.com",
  projectId: "rubberducker-35ee3",
  storageBucket: "rubberducker-35ee3.appspot.com",
  messagingSenderId: "662216577792",
  appId: "1:662216577792:web:9f58c94244e13fbaff59e5",
};

const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const db = getFirestore(app);
// const functions = getFunctions(app);

export { db };
