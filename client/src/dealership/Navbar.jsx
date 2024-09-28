import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/'); // Redirect to home page after sign-out
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="text-white text-2xl font-bold" onClick={()=>navigate('/dealership/dashboard')}>
        websiteName
      </div>
      <div className="flex space-x-4">
        <Link to="/dealership/inventory" className="text-white hover:text-gray-400">Inventory</Link>
        <Link to="/dealership/boost" className="text-white hover:text-gray-400">Boost</Link>
        <Link to="/dealership/profile" className="text-white hover:text-gray-400">Profile</Link>
      </div>
      <button 
        onClick={handleSignOut} 
        className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </nav>
  );
};

export default Navbar;