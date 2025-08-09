const LoadingScreen = ({ checking }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">
          {checking ? "Đang tải dữ liệu..." : "Đang kiểm tra đăng nhập..."}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
