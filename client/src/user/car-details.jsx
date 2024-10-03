import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import { getFirestore, doc, getDoc, updateDoc, increment, writeBatch } from "firebase/firestore";

const CarDetails = () => {
  const { carID } = useParams();
  const navigate = useNavigate();

  const [carDetails, setCarDetails] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHeartClicked, setIsHeartClicked] = useState(false);
  const reviewSectionRef = useRef(null);

  const db = getFirestore();

  useEffect(() => {
    if (carID) {
      fetchCarDetails(carID);
    }
  }, [carID]);

  const fetchCarDetails = async (carID) => {
    try {
      const carDocRef = doc(db, "carDetails", carID);
      const carDoc = await getDoc(carDocRef);

      if (carDoc.exists()) {
        const carData = carDoc.data();
        setCarDetails(carData);
        incrementViewCount(carID, carData.dealerID);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching car details:", error);
    }
  };

  const incrementViewCount = async (carID, dealerID) => {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const carViewsDocRef = doc(db, "views", `car_${carID}_${currentDate}`);
    const dealerViewsDocRef = doc(db, "views", `dealer_${dealerID}_${currentDate}`);

    const batch = writeBatch(db);
    batch.set(carViewsDocRef, { count: increment(1) }, { merge: true });
    batch.set(dealerViewsDocRef, { count: increment(1) }, { merge: true });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error incrementing view counts in batch:", error);
    }
  };

  const handleHeartClick = (index) => {
    setRating(index + 1);
  };

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const handleSubmitReview = () => {
    alert(`Review submitted: ${review}`);
    // Here, you might want to save the review to Firestore or another backend service
  };

  const handleScrollToReview = () => {
    if (reviewSectionRef.current) {
      reviewSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSuggestedCarClick = (car) => {
    navigate(`/carDetails`, { state: { carID: car.id } });
  };

  const handleMakeOfferClick = () => {
    navigate("/make-an-offer", { state: { carID } });
  };

  const handleCompareClick = () => {
    navigate("/compareCars", { state: { carID } });
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Overview":
        return (
          <div className="p-4">
            <p>{carDetails.carDesc}</p>
          </div>
        );
      case "Specification":
        return (
          <div className="p-4">
            <ul>
              <li><strong>Type:</strong> {carDetails.carType}</li>
              <li><strong>Color:</strong> {carDetails.carColor}</li>
              <li><strong>Fuel:</strong> {carDetails.carFuel}</li>
              <li><strong>Transmission:</strong> {carDetails.carTransmission}</li>
              <li><strong>Engine Capacity:</strong> {carDetails.engineCap} cc</li>
              <li><strong>Seating Capacity:</strong> {carDetails.seatCap}</li>
              <li><strong>Condition:</strong> {carDetails.carCondition}</li>
              <li><strong>Location:</strong> {carDetails.location}</li>
              <li><strong>Additional Features:</strong> {carDetails.additionalFeatures.join(', ')}</li>
            </ul>
          </div>
        );
      case "Seller Info":
        return (
          <div className="p-4">
            <p><strong>Dealer ID:</strong> {carDetails.dealerID}</p>
            <p><strong>Dealership:</strong> {carDetails.dealershipTitle}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleHeartIconClick = () => {
    setIsHeartClicked(!isHeartClicked);
    navigate("/wishList");
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="max-w-5xl w-full bg-white rounded-lg shadow-md p-6">
          {carDetails ? (
            <>
              <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2 p-4">
                  <img
                    src={carDetails.thumbnailImg || "../assets/carPlaceholdr.jpg"}
                    alt={carDetails.carName}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="w-full lg:w-1/2 p-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">{carDetails.carName || "Car"}</h2>
                    <p className="text-xl text-green-600">₹{carDetails.carPrice || "Price not available"}</p>
                  </div>
                  <div className="flex items-center my-4 text-sm text-gray-500">
                    <span className="font-medium">{carDetails.dealershipTitle || "Luxury Motors"}</span>
                    <svg
                      className="w-5 h-5 text-green-500 ml-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="relative ml-2">
                      <button
                        aria-label="Verified Dealership Info"
                        className="text-gray-400 hover:text-gray-600"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <svg
                          className="w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M12 18h.01"
                          />
                        </svg>
                      </button>
                      {showTooltip && (
                        <div className="absolute left-0 mt-2 w-48 p-2 bg-white text-gray-700 text-sm border border-gray-200 rounded-lg shadow-lg">
                          This dealership is verified for authenticity and reliability.
                        </div>
                      )}
                    </div>
                    <svg
                      onClick={handleHeartIconClick}
                      aria-label={isHeartClicked ? "Remove from Wishlist" : "Add to Wishlist"}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-6 h-6 ml-2 cursor-pointer ${isHeartClicked ? "text-red-500" : "text-gray-400"}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  </div>
                  <div className="flex space-x-2 mb-4">
                    <button className="bg-black text-white px-4 py-2 rounded-md">
                      Check market value
                    </button>
                    <button
                      className="bg-black text-white px-4 py-2 rounded-md"
                      onClick={handleCompareClick}
                    >
                      Compare
                    </button>
                    <button
                      className="bg-black text-white px-4 py-2 rounded-md"
                      onClick={handleMakeOfferClick}
                    >
                      Make an Offer
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex space-x-4">
                  {["Overview", "Specification", "Seller Info"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-md ${selectedTab === tab ? "bg-black text-white" : "bg-gray-200 text-black"}`}
                      onClick={() => setSelectedTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  {renderTabContent()}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold">Reviews</h3>
                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      onClick={() => handleHeartClick(index)}
                      className={`w-6 h-6 cursor-pointer ${index < rating ? "text-yellow-500" : "text-gray-300"}`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  ))}
                </div>
                <textarea
                  value={review}
                  onChange={handleReviewChange}
                  className="w-full mt-4 p-2 border border-gray-300 rounded-md"
                  placeholder="Write your review here..."
                />
                <button
                  onClick={handleSubmitReview}
                  className="mt-2 bg-black text-white px-4 py-2 rounded-md"
                >
                  Submit Review
                </button>
              </div>
              <div ref={reviewSectionRef} className="mt-6">
                <h3 className="text-2xl font-bold">Suggested Cars</h3>
                <div className="flex space-x-4 mt-4">
                  {/* Render suggested cars here */}
                </div>
              </div>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </>
  );
};

export default CarDetails;