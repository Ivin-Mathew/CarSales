// VehicleDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const VehicleDetails = () => {
  const { carID } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [originalVehicle, setOriginalVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const carDetailsRef = doc(db, 'carDetails', carID);
        const carDoc = await getDoc(carDetailsRef);

        if (carDoc.exists()) {
          const vehicleData = carDoc.data();
          setVehicle(vehicleData);
          setOriginalVehicle(vehicleData);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [carID, db]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prevVehicle) => ({
      ...prevVehicle,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageRef = ref(storage, `cars/${carID}/thumbnail_${file.name}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      setVehicle((prevVehicle) => ({
        ...prevVehicle,
        thumbnailImg: imageUrl,
      }));
    }
  };

  const handleRemoveImage = (image) => {
    setVehicle((prevVehicle) => ({
      ...prevVehicle,
      images: prevVehicle.images.filter((img) => img !== image),
    }));
  };
  
  const handleSave = async () => {
    try {
      const carDetailsRef = doc(db, 'carDetails', carID);
      const carsRef = doc(db, 'cars', carID);

      await updateDoc(carDetailsRef, vehicle);
      await updateDoc(carsRef, {
        carName: vehicle.carName,
        carPrice: vehicle.carPrice,
        carFuel: vehicle.carFuel,
        thumbnailImg: vehicle.thumbnailImg,
        hidden: vehicle.hidden,
      });

      alert('Vehicle details updated successfully!');
      setOriginalVehicle(vehicle);
      setIsEditing(false);
      navigate('/dealership/dashboard');
    } catch (error) {
      console.error('Error updating vehicle details:', error);
      alert('Error updating vehicle details. Please try again.');
    }
  };

  const handleRevert = () => {
    setVehicle(originalVehicle);
    setIsEditing(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vehicle) {
    return <div>No vehicle found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold">Edit Vehicle Details</h2>
        <div>
          <button
            className="border-2 rounded-lg text-white bg-yellow-500 hover:bg-yellow-700 p-2 mr-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button
              className="border-2 rounded-lg text-white bg-red-500 hover:bg-red-700 p-2"
              onClick={handleRevert}
            >
              Revert
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col bg-white p-6 rounded-lg shadow-lg">
        <label className="mb-2 font-semibold">Hidden</label>
        <select
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="hidden"
          value={vehicle.hidden}
          onChange={handleInputChange}
          disabled={!isEditing}
        >
          <option value={false}>Visible</option>
          <option value={true}>Hidden</option>
        </select>
        <label className="mb-2 font-semibold">Car VIN</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carVIN"
          value={vehicle.carVIN}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Name</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carName"
          value={vehicle.carName}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Company</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carCompany"
          value={vehicle.carCompany}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Price</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carPrice"
          value={vehicle.carPrice}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Manufactured Year</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="manufacturedYear"
          value={vehicle.manufacturedYear}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Description</label>
        <textarea
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carDesc"
          value={vehicle.carDesc}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Model</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carType"
          value={vehicle.carType}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Color</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carColor"
          value={vehicle.carColor}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Fuel</label>
        <select
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carFuel"
          value={vehicle.carFuel}
          onChange={handleInputChange}
          disabled={!isEditing}
        >
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="petrolHybrid">Petrol Hybrid</option>
          <option value="dieselHybrid">Diesel Hybrid</option>
          <option value="electric">Electric</option>
        </select>
        <label className="mb-2 font-semibold">Number of Previous Owners</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="ownersNum"
          value={vehicle.ownersNum}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Transmission</label>
        <select
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carTransmission"
          value={vehicle.carTransmission}
          onChange={handleInputChange}
          disabled={!isEditing}
        >
          <option value="manual">Manual</option>
          <option value="amt">AMT</option>
          <option value="cvt">CVT</option>
          <option value="electric">Electric</option>
        </select>
        <label className="mb-2 font-semibold">Engine Capacity</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="engineCap"
          value={vehicle.engineCap}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Seating Capacity</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="seatCap"
          value={vehicle.seatCap}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Car Condition</label>
        <select
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="carCondition"
          value={vehicle.carCondition}
          onChange={handleInputChange}
          disabled={!isEditing}
        >
          <option value="poor">Poor</option>
          <option value="average">Average</option>
          <option value="good">Good</option>
          <option value="excellent">Excellent</option>
        </select>
        <label className="mb-2 font-semibold">Location</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          name="location"
          value={vehicle.location}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <label className="mb-2 font-semibold">Thumbnail Image</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          type="file"
          onChange={handleImageChange}
        />
        {vehicle.thumbnailImg && (
          <img
            src={vehicle.thumbnailImg}
            alt="Thumbnail"
            className="w-24 h-24 object-cover mb-4"
          />
        )}
        <label className="mb-2 font-semibold">Additional Images</label>
        <input
          className="border-2 border-gray-300 mb-4 p-2 rounded-lg"
          type="file"
          multiple
          onChange={handleImageChange}
          disabled={!isEditing}
        />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {vehicle.images && vehicle.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Car ${index}`}
                className="w-full h-auto rounded-md"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                onClick={() => handleRemoveImage(image)}
                disabled={!isEditing}
              >
                X
              </button>
            </div>
          ))}
        </div>
        <label className="mb-2 font-semibold">Additional Features</label>
        <div className="flex mb-4">
          <input
            className="border-2 border-gray-300 p-2 rounded-lg flex-grow"
            name="featureInput"
            value={vehicle.featureInput || ''}
            onChange={(e) => setVehicle({ ...vehicle, featureInput: e.target.value })}
          />
          <button
            type="button"
            className="ml-2 border-2 rounded-lg text-white bg-green-500 hover:bg-green-700 p-2"
            onClick={() => {
              if (vehicle.featureInput.trim()) {
                setVehicle((prevVehicle) => ({
                  ...prevVehicle,
                  additionalFeatures: [...prevVehicle.additionalFeatures, vehicle.featureInput.trim()],
                  featureInput: '',
                }));
              }
            }}
            disabled={!isEditing}
          >
            Add
          </button>
        </div>
        <ul className="mb-4">
          {vehicle.additionalFeatures.map((feature, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              {feature}
              <button
                type="button"
                className="ml-2 border-2 rounded-lg text-white bg-red-500 hover:bg-red-700 p-2"
                onClick={() => {
                  const newFeatures = vehicle.additionalFeatures.filter((_, i) => i !== index);
                  setVehicle((prevVehicle) => ({
                    ...prevVehicle,
                    additionalFeatures: newFeatures,
                  }));
                }}
                disabled={!isEditing}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          className="border-2 rounded-lg text-white bg-blue-500 hover:bg-blue-700 p-4"
          onClick={handleSave}
          disabled={!isEditing}
        >
          Save
        </button>
        <button
          className="border-2 rounded-lg text-white bg-gray-500 hover:bg-gray-700 p-4 ml-4"
          onClick={handleRevert}
        >
          Revert
        </button>
      </div>
    </div>
  );
};

export default VehicleDetails;