// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCwM3mQ6mw_C56WEa5dwUEpKzKKfXV-mmo",
  authDomain: "bikerental-iot.firebaseapp.com",
  databaseURL: "https://bikerental-iot-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bikerental-iot",
  storageBucket: "bikerental-iot.appspot.com",
  messagingSenderId: "395966720830",
  appId: "1:395966720830:android:9501c218cae99e91eeda6f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { auth, db };
