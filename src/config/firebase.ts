// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBu6skUfk3VWSbr8ThWsxxGTA-XJiCtoF4',
  authDomain: 'datn-7c4ee.firebaseapp.com',
  projectId: 'datn-7c4ee',
  storageBucket: 'datn-7c4ee.appspot.com',
  messagingSenderId: '747962153989',
  appId: '1:747962153989:web:37344f18901f5d6596706c',
  measurementId: 'G-W4T4KSW639',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
