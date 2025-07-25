// 📁 src/components/Navbar.jsx
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="bg-white px-4 py-3 shadow flex justify-between items-center">
      <h1 className="text-xl font-semibold">SPBMS Admin</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-red-500 hover:underline"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
