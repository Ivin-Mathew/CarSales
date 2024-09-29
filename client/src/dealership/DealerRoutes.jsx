// DealerRoutes.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
// Import the initialized auth
import DealershipProfile from './DealerProfile';
import DealershipDashboard from './DealershipDashboard';
import GarageManagement from './GarageManagement';
import AddNewVehicle from './AddNewVehicle';

const DealerRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthorized(true);
        const userDoc = doc(db, 'dealershipsInfo', user.email);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setIsProfileCompleted(userData.isProfileCompleted);
          console.log("Inside snapshot");
        }


        // Check if profile is completed
        // setIsProfileCompleted(true or false based on your logic);
      } else {
        setIsAuthorized(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  if (!isProfileCompleted && location.pathname !== '/dealership/profile') {
    return <Navigate to="/dealership/profile" />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dealership/dashboard" />} />
      <Route path="profile/*" element={<DealershipProfile />} />
      <Route path="dashboard" element={<DealershipDashboard />} />
      <Route path="garageManagement/*" element={<GarageManagement />} />
      <Route path="addNewVehicle/*" element={<AddNewVehicle />} />
    </Routes>
  );
};

export default DealerRoutes;