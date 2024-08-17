import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB0Nbgh9InXDkZJvO_4Hd-05ZqSfV1d_Ns",
    authDomain: "mtgprojekt-ba1c2.firebaseapp.com",
    projectId: "mtgprojekt-ba1c2",
    storageBucket: "mtgprojekt-ba1c2.appspot.com",
    messagingSenderId: "1099298020046",
    appId: "1:1099298020046:web:9e583021706259e4e40e9f"
  };

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
export { firebase };
