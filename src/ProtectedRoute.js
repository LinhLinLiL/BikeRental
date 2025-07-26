import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const ADMIN_EMAIL = "linhpnhe176376@fpt.edu.vn"; // Email admin của bạn
const SESSION_DURATION = 5 * 60 * 1000; // 5 phút

const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        // Kiểm tra session thời gian đăng nhập
        const loginTimeStr = localStorage.getItem("loginTime");
        const now = Date.now();

        if (!loginTimeStr) {
          // Lần đầu đăng nhập => lưu thời gian
          localStorage.setItem("loginTime", now.toString());
          setIsAuthorized(true);
        } else {
          const loginTime = parseInt(loginTimeStr, 10);
          // Nếu đã quá 5 phút thì đăng xuất
          if (now - loginTime > SESSION_DURATION) {
            signOut(auth);
            localStorage.removeItem("loginTime");
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        }
      } else {
        // Chưa đăng nhập hoặc không phải admin => không cho truy cập
        setIsAuthorized(false);
        localStorage.removeItem("loginTime");
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    // Đang check trạng thái auth
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    // Chưa đăng nhập hoặc không đúng quyền => chuyển về login
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập admin và phiên còn hiệu lực => cho phép truy cập
  return children;
};

export default ProtectedRoute;
