import {  auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export default function useAuthCheck(navigate) {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return authChecked;
}
