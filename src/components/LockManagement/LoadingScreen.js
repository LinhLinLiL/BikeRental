const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center text-gray-700">
    {message}
  </div>
);

export default LoadingScreen;
