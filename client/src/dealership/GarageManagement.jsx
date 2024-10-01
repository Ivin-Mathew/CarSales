import { useState, useEffect } from 'react';
import {  collection, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import {auth, db} from "../firebase";
import { useNavigate } from 'react-router-dom';

function GarageManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [hiddenVehicles, setHiddenVehicles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getVehicles = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          throw new Error('User not authenticated');
        }

        /* const userID = user.uid; */
        const querySnapshot = await getDocs(collection(db, 'cars'));

        const vehiclesList = [];
        querySnapshot.forEach((doc) => {
          vehiclesList.push({ id: doc.id, ...doc.data() });
        });

        const visibleVehicles = vehiclesList.filter((vehicle) => !vehicle.hidden);
        const hiddenVehicles = vehiclesList.filter((vehicle) => vehicle.hidden);
        setVehicles(visibleVehicles);
        setHiddenVehicles(hiddenVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    getVehicles();
  }, []);

  const handleCardClick = (carID) => {
    navigate(`/dealership/manageVehicle/${carID}`);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold mb-6">Inventory</h2>
        <InventoryList vehicles={vehicles} hiddenVehicles={hiddenVehicles} onCardClick={handleCardClick}/>
      </div>
    </>
  );
}

const InventoryList = ({ vehicles, hiddenVehicles, onCardClick }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All cars</h2>
      <div className="grid grid-cols-4 gap-5 mb-10">
        {vehicles.length === 0 ? (
          <p>No cars available.</p>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="border border-gray-300 rounded-lg p-4 text-center transition-transform duration-300 ease-in-out hover:scale-105" onClick={()=> onCardClick(vehicle.carID)}>
                <img
                  src={vehicle.thumbnailImg}
                  alt="car"
                  className="w-[20rem] h-auto rounded-md mb-4 fit"
                />
              
              <p className="text-lg font-bold mb-2">{vehicle.carName}</p>
              <p className="text-gray-600">${vehicle.carPrice}</p>
              <p className="text-gray-600">{vehicle.carFuel}</p>
            </div>
          ))
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Hidden cars</h2>
      <div className="grid grid-cols-4 gap-5 mb-10">
        {hiddenVehicles.length === 0 ? (
          <p>No hidden cars.</p>
        ) : (
          hiddenVehicles.map((vehicle) => (
            <div key={vehicle.id} className="border border-gray-300 rounded-lg p-4 text-center transition-transform duration-300 ease-in-out hover:scale-105" onClick={()=> onCardClick(vehicle.carID)}>
              {vehicle.images && vehicle.images.length > 0 && (
                <img
                  src={vehicle.images[0]}
                  alt="car"
                  className="w-full h-auto rounded-md mb-4"
                />
              )}
              <p className="text-lg font-bold mb-2">{vehicle.name}</p>
              <p className="text-gray-600">${vehicle.model}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GarageManagement;