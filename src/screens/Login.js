import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import BikeImage from './assets/bike.jpg';
const ADMIN_EMAIL = "linhpnhe176376@fpt.edu.vn"; // Thay bằng email admin của bạn

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError("Chỉ tài khoản admin được phép đăng nhập.");
        setIsLoading(false);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Sai email hoặc mật khẩu");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Illustration Section */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative w-96 h-96">
            {/* Background Circle */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30"></div>

            {/* Person on Bicycle Illustration */}
            <img
              src={BikeImage}
      alt="Person riding a blue bicycle"
              className="mx-auto w-80 h-80 object-contain rounded-xl shadow-md"
            />

            {/* You can replace above data:image with your own bicycle SVG/PNG asset */}
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Tối ưu bãi đỗ
              <br />
              <span className="text-blue-600">Tăng tốc trải nghiệm</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-md">
              Đăng nhập vào hệ thống quản lý xe đạp thông minh và bắt đầu khám phá những tính năng tuyệt vời ngay hôm nay!
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🚴‍♂️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng Nhập Admin</h2>
              <p className="text-gray-600 text-sm">Truy cập hệ thống quản lý Smart Bike</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center flex items-center justify-center">
                  <span className="mr-2">⚠️</span> {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Họ tên đầy đủ</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50"
                  placeholder="Quản trị viên"
                  value="Quản trị viên"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="admin@smartbike.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Lĩnh vực quan tâm</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="Quản lý xe đạp thông minh"
                  value="Quản lý xe đạp thông minh"
                  disabled
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                  Tôi đồng ý với{" "}
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a href="#" className="text-blue-600 hover:underline">
                    Điều khoản & Điều kiện
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">Bảo mật bởi Smart Bike Management System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
