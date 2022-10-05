// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
require("@firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhdNrcxLx9dC0I3b_50-LEZnEphoaAtqk",
  authDomain: "biblioadm-6b16b.firebaseapp.com",
  projectId: "biblioadm-6b16b",
  storageBucket: "biblioadm-6b16b.appspot.com",
  messagingSenderId: "340665448805",
  appId: "1:340665448805:web:beea05110813db02f0498c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();