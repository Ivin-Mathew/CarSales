import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DealershipProfile from './dealerProfile';
import DealershipDashboard from './DealershipDashboard';
import GarageManagement from './GarageManagement';
import AddNewVehicle from './AddNewVehicle';

const DealerRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = doc(db, 'dealershipsInfo', user.email);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setIsAuthorized(true);
          setIsProfileCompleted(data.isProfileCompleted);
        }
      }
      setLoading(false);
    });
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
      <Route path="profile" element={<DealershipProfile />} />
      <Route path="dashboard" element={<DealershipDashboard />} />
      <Route path="garageManagement" element={<GarageManagement />} />
      <Route path="addNewVehicle" element={<AddNewVehicle />} />
    </Routes>
  );
};

export default DealerRoutes;