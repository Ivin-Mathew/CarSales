import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Navbar from "./Navbar";

const DealershipDashboard = () => {
  const [selectedTime, setSelectedTime] = useState("All time");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userData1, setUserData1] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = doc(db, 'dealershipsInfo', user.email);
        
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData1(userData);
          if (userData.isDealer === true) {
            if (userData.isProfileCompleted === false){
              navigate("/dealership/profile");
            }
            setLoading(false);
          }
          else {
            
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    });
  }, [navigate]);

  // Sample Data for User Interactions
  const data = [
    { time: "All time", interactions: 100 },
    { time: "Past year", interactions: 120 },
    { time: "Past month", interactions: 400 },
    { time: "Past week", interactions: 50 },
  ];
  // Sample data based on selected time period (you can modify this to match your needs)
  const displayedData = [
    { name: "Jan", interactions: 100 },
    { name: "Feb", interactions: 120 },
    { name: "Mar", interactions: 400 },
    { name: "Apr", interactions: 500 },
    { name: "May", interactions: 450 },
    { name: "Jun", interactions: 300 },
    { name: "Jul", interactions: 100 },
  ];
  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center p-5 max-w-3xl mx-auto text-center">
        {/* Welcome Message */}
        <h1 className="text-2xl font-bold mb-5">Welcome, {userData1.dealershipName}</h1>

        {/* Buttons */}
        <div className="flex gap-5 mb-5">
          <button
            className="px-5 py-2 rounded-lg border border-gray-400 cursor-pointer bg-white transition-colors duration-300 hover:bg-gray-200"
            onClick={() => navigate('/dealership/garageManagement')}
          >
            Garage management
          </button>
          <button
            className="px-5 py-2 rounded-lg border border-gray-400 cursor-pointer bg-white transition-colors duration-300 hover:bg-gray-200"
            onClick={() => navigate('/dealership/addNewVehicle')}
          >
            Add new vehicle
          </button>
        </div>

        {/* Boost Your Cars Button */}
        <div className="mb-5">
          <button className="px-10 py-4 bg-blue-500 text-white rounded-lg cursor-pointer text-lg transition-colors duration-300 hover:bg-blue-700" onClick={() => navigate('/dealership/boost')}>
            Boost your cars!
          </button>
        </div>

        {/* Chart Heading */}
        <h2 className="text-xl mt-7 mb-5">User Interactions</h2>

        {/* Line Chart */}
        <div className="w-full h-72 mt-7">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={displayedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="interactions"
                stroke="#ff4d4d"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time Filters */}
        <div className="flex gap-2 mt-5">
          {data.map((item) => (
            <button
              key={item.time}
              onClick={() => setSelectedTime(item.time)}
              className={`px-4 py-2 rounded-lg border border-gray-400 cursor-pointer transition-colors duration-300 ${
                selectedTime === item.time ? "bg-gray-300" : "bg-white"
              }`}
            >
              {item.time}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default DealershipDashboard;