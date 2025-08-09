import { useState, useEffect } from "react";
import { auth } from "../../../firebase/config"; // đường dẫn phù hợp với bạn
import { onAuthStateChanged } from "firebase/auth";

export default function useAuthCheck(navigate) {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      } else {
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return authChecked;
}
