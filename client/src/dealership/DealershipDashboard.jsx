// DealershipDashboard.jsx

import { useState, useEffect, useRef } from "react";
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
import { getFirestore, doc, getDoc, where, query, getDocs, collection, orderBy } from "firebase/firestore";
import Navbar from "./Navbar";

const DealershipDashboard = () => {
  const [selectedTime, setSelectedTime] = useState("All time");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userData1, setUserData1] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);

  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = doc(db, 'dealershipsInfo', user.email);
        try {
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            console.log("User Data:", userData); // Debugging
            setUserData1(userData);
            if (userData.isDealer === true) {
              if (userData.isProfileCompleted === false){
                navigate("/dealership/profile");
                return;
              }
              setLoading(false);
            }
            else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate, db]);

  // Function to get date range based on selectedTime
  const getDateRange = (time) => {
    const today = new Date();
    let startDate;
    let endDate = today;

    switch (time) {
      case "All time":
        // For "All time", set a very old start date
        startDate = new Date('2000-01-01');
        break;
      case "Past year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "Past month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "Past week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      default:
        startDate = new Date('2000-01-01');
    }

    return {
      startDate: startDate.toISOString().split('T')[0], // 'YYYY-MM-DD'
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // Function to fetch dealership views
  const fetchDealershipViews = async (dealerID, time) => {
    setLoading(true);
    console.log(`Fetching views for Dealer ID: ${dealerID}, Time Filter: ${time}`); // Debugging
    try {
      const { startDate, endDate } = getDateRange(time);
      console.log(`Date Range - Start: ${startDate}, End: ${endDate}`); // Debugging

      const viewsQuery = query(
        collection(db, 'views'),
        where('type', '==', 'dealer'),
        where('dealerID', '==', dealerID),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date')
      );

      const querySnapshot = await getDocs(viewsQuery);
      if (querySnapshot.empty) {
        console.log('No matching views documents found.');
        setDisplayedData([]);
      } else {
        const views = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          views.push({
            date: data.date,
            count: data.count,
          });
        });

        console.log("Fetched Views:", views); // Debugging

        // Aggregate data based on selected time period
        let aggregatedData = [];
        switch (time) {
          case "All time":
          case "Past year":
            // Aggregate by month
            const monthMap = {};
            views.forEach(view => {
              const month = view.date.slice(0, 7); // 'YYYY-MM'
              if (monthMap[month]) {
                monthMap[month] += view.count;
              } else {
                monthMap[month] = view.count;
              }
            });
            aggregatedData = Object.entries(monthMap).map(([month, count]) => ({
              name: month,
              interactions: count,
            }));
            break;
          case "Past month":
            // Aggregate by week
            const weekMap = {};
            views.forEach(view => {
              const weekNumber = getWeekNumber(new Date(view.date));
              const year = view.date.slice(0, 4);
              const weekKey = `${year}-W${weekNumber}`;
              if (weekMap[weekKey]) {
                weekMap[weekKey] += view.count;
              } else {
                weekMap[weekKey] = view.count;
              }
            });
            aggregatedData = Object.entries(weekMap).map(([week, count]) => ({
              name: week,
              interactions: count,
            }));
            break;
          case "Past week":
            // Aggregate by day
            const dayMap = {};
            views.forEach(view => {
              const day = view.date; // 'YYYY-MM-DD'
              if (dayMap[day]) {
                dayMap[day] += view.count;
              } else {
                dayMap[day] = view.count;
              }
            });
            aggregatedData = Object.entries(dayMap).map(([day, count]) => ({
              name: day,
              interactions: count,
            }));
            break;
          default:
            aggregatedData = [];
        }

        console.log("Aggregated Data:", aggregatedData); // Debugging

        // Sort data by name (date)
        aggregatedData.sort((a, b) => (a.name > b.name ? 1 : -1));

        setDisplayedData(aggregatedData);
      }
    } catch (error) {
      console.error("Error fetching dealership views:", error);
      setDisplayedData([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Helper function to get week number
  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  useEffect(() => {
    if (userData1.dealerID && selectedTime) {
      fetchDealershipViews(userData1.dealerID, selectedTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData1.dealerID, selectedTime]);

  // Time filter options
  const timeOptions = ["All time", "Past year", "Past month", "Past week"];

  return (
    <>
      <Navbar />
      {loading ? (
        // Enhanced Loading Indicator
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="text-2xl">Loading...</div>
        </div>
      ) : (
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
            <button
              className="px-10 py-4 bg-blue-500 text-white rounded-lg cursor-pointer text-lg transition-colors duration-300 hover:bg-blue-700"
              onClick={() => navigate('/dealership/boost')}
            >
              Boost your cars!
            </button>
          </div>

          {/* Chart Heading */}
          <h2 className="text-xl mt-7 mb-5">User Interactions</h2>

          {/* Line Chart */}
          <div className="w-full h-72 mt-7">
            {displayedData.length > 0 ? (
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
            ) : (
              <p>No interaction data available for the selected time period.</p>
            )}
          </div>

          {/* Time Filters */}
          <div className="flex gap-2 mt-5">
            {timeOptions.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedTime(item)}
                className={`px-4 py-2 rounded-lg border border-gray-400 cursor-pointer transition-colors duration-300 ${
                  selectedTime === item ? "bg-gray-300" : "bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DealershipDashboard;
