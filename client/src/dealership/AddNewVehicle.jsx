import { useState } from 'react';
import { getFirestore, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AddNewVehicle = () => {
  // State variables for car details
  const [carVIN, setCarVIN] = useState('');
  const [carName, setCarName] = useState('');
  const [carCompany, setCarCompany] = useState('');
  const [carPrice, setCarPrice] = useState('');
  const [manufacturedYear, setManufacturedYear] = useState('');
  const [carDesc, setCarDesc] = useState('');
  const [carType, setCarType] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carFuel, setCarFuel] = useState('');
  const [ownersNum, setOwnersNum] = useState('');
  const [carTransmission, setCarTransmission] = useState('');
  const [engineCap, setEngineCap] = useState('');
  const [seatCap, setSeatCap] = useState('');
  const [carCondition, setCarCondition] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [additionalFeatures, setAdditionalFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handler for selecting multiple images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    const newNames = files.map((file) => file.name);
    setImageNames((prev) => [...prev, ...newNames]);
  };

  // Handler to remove a selected image
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newNames = imageNames.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    setImageNames(newNames);
  };

  // Handler for selecting a thumbnail image
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailImage(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Handler to add an additional feature
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setAdditionalFeatures((prev) => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  // Handler to remove an additional feature
  const handleRemoveFeature = (index) => {
    const newFeatures = additionalFeatures.filter((_, i) => i !== index);
    setAdditionalFeatures(newFeatures);
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;
    const dealerID = user ? user.uid : null;

    if (!dealerID) {
      alert('User not authenticated');
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const storage = getStorage();

    try {
      // Generate a unique document reference
      const carDetailsRef = doc(collection(db, 'carDetails'));
      const carDetailsId = carDetailsRef.id;

      // Prepare car data including carNameLower for case-insensitive search
      const carData = {
        carVIN,
        carName,
        carNameLower: carName.toLowerCase(), // Added field
        carCompany,
        carPrice: parseFloat(carPrice), // Ensure numeric value
        manufacturedYear: parseInt(manufacturedYear, 10), // Ensure integer
        carDesc,
        carType,
        carColor,
        carFuel,
        ownersNum: parseInt(ownersNum, 10), // Ensure integer
        carTransmission,
        engineCap: parseFloat(engineCap), // Ensure numeric value
        seatCap: parseInt(seatCap, 10), // Ensure integer
        carCondition,
        location,
        additionalFeatures,
        dealerID,
        priority: 0, // Default priority
        hidden: false,
      };

      // Add initial car details to Firestore
      await setDoc(carDetailsRef, carData);

      // Function to upload a single image and return its URL
      const uploadImage = async (image, isThumbnail = false) => {
        // Generate a unique image name to prevent overwriting
        const timestamp = Date.now();
        const uniqueName = `${isThumbnail ? 'thumbnail_' : ''}${timestamp}_${image.name}`;
        const imageRef = ref(storage, `cars/${carDetailsId}/${uniqueName}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        return url;
      };

      // Upload all images and get their URLs
      const imageUrls = await Promise.all(
        images.map((image) => uploadImage(image))
      );

      // Upload thumbnail image and get its URL
      let thumbnailUrl = '';
      if (thumbnailImage) {
        thumbnailUrl = await uploadImage(thumbnailImage, true);
      }

      // Update car details with image URLs and thumbnail URL
      await updateDoc(carDetailsRef, {
        images: imageUrls,
        thumbnailImg: thumbnailUrl,
      });

      setLoading(false);
      alert('Car details added successfully!');
      navigate('/dealership/dashboard');
    } catch (error) {
      setLoading(false);
      console.error('Error adding car details:', error);
      alert('Error adding car details. Please try again.');
    }
  };

  return (
    <div className='flex flex-col justify-center items-center bg-gray-100 p-6'>
      <h1 className='text-4xl font-bold mb-6'>Add New Vehicle</h1>
      <form
        className='flex flex-col bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl'
        onSubmit={handleSubmit}
      >
        {/* Car VIN */}
        <label className='mb-2 font-semibold'>Car VIN</label>
        <input
          type='text'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carVIN}
          onChange={(e) => setCarVIN(e.target.value)}
          required
        />

        {/* Car Name */}
        <label className='mb-2 font-semibold'>Car Name</label>
        <input
          type='text'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carName}
          onChange={(e) => setCarName(e.target.value)}
          required
        />

        {/* Car Company */}
        <label className='mb-2 font-semibold'>Car Company</label>
        <input
          type='text'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carCompany}
          onChange={(e) => setCarCompany(e.target.value)}
          required
        />

        {/* Car Price */}
        <label className='mb-2 font-semibold'>Car Price (₹)</label>
        <input
          type='number'
          min='0'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carPrice}
          onChange={(e) => setCarPrice(e.target.value)}
          required
        />

        {/* Manufactured Year */}
        <label className='mb-2 font-semibold'>Manufactured Year</label>
        <input
          type='number'
          min='1900'
          max={new Date().getFullYear()}
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={manufacturedYear}
          onChange={(e) => setManufacturedYear(e.target.value)}
          required
        />

        {/* Car Description */}
        <label className='mb-2 font-semibold'>Car Description</label>
        <textarea
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carDesc}
          onChange={(e) => setCarDesc(e.target.value)}
          required
        />

        {/* Car Model */}
        <label className='mb-2 font-semibold'>Car Model</label>
        <input
          type='text'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
          required
        />

        {/* Car Color */}
        <label className='mb-2 font-semibold'>Car Color</label>
        <input
          type='text'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carColor}
          onChange={(e) => setCarColor(e.target.value)}
          required
        />

        {/* Car Fuel */}
        <label className='mb-2 font-semibold'>Car Fuel</label>
        <select
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carFuel}
          onChange={(e) => setCarFuel(e.target.value)}
          required
        >
          <option value="">Select Fuel Type</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Petrol Hybrid">Petrol Hybrid</option>
          <option value="Diesel Hybrid">Diesel Hybrid</option>
          <option value="Electric">Electric</option>
        </select>

        {/* Number of Previous Owners */}
        <label className='mb-2 font-semibold'>Number of Previous Owners</label>
        <input
          type='number'
          min='0'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={ownersNum}
          onChange={(e) => setOwnersNum(e.target.value)}
          required
        />

        {/* Car Transmission */}
        <label className='mb-2 font-semibold'>Car Transmission</label>
        <select
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carTransmission}
          onChange={(e) => setCarTransmission(e.target.value)}
          required
        >
          <option value="">Select Transmission</option>
          <option value="Manual">Manual</option>
          <option value="AMT">AMT</option>
          <option value="CVT">CVT</option>
          <option value="Electric">Electric</option>
        </select>

        {/* Engine Capacity */}
        <label className='mb-2 font-semibold'>Engine Capacity (cc)</label>
        <input
          type='number'
          min='0'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={engineCap}
          onChange={(e) => setEngineCap(e.target.value)}
          required
        />

        {/* Seating Capacity */}
        <label className='mb-2 font-semibold'>Seating Capacity</label>
        <input
          type='number'
          min='1'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={seatCap}
          onChange={(e) => setSeatCap(e.target.value)}
          required
        />

        {/* Car Condition */}
        <label className='mb-2 font-semibold'>Car Condition</label>
        <select
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={carCondition}
          onChange={(e) => setCarCondition(e.target.value)}
          required
        >
          <option value="">Select Condition</option>
          <option value="Poor">Poor</option>
          <option value="Average">Average</option>
          <option value="Good">Good</option>
          <option value="Excellent">Excellent</option>
        </select>

        {/* Location */}
        <label className='mb-2 font-semibold'>Location</label>
        <input
          type='text'
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        {/* Images */}
        <label className='mb-2 font-semibold'>Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          onChange={handleImageChange}
        />
        <div className='flex flex-wrap mb-4'>
          {imagePreviews.map((src, index) => (
            <div key={index} className='relative'>
              <img src={src} alt={`Preview ${index}`} className='w-24 h-24 object-cover m-2 rounded-lg shadow-md' />
              <button
                type="button"
                className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2'
                onClick={() => handleRemoveImage(index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        {imageNames.length > 0 && (
          <ul className='mb-4'>
            {imageNames.map((name, index) => (
              <li key={index} className='flex justify-between items-center mb-2'>
                {name}
                <button
                  type="button"
                  className='ml-2 bg-red-500 text-white rounded-full px-2 py-1'
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Thumbnail Image */}
        <label className='mb-2 font-semibold'>Thumbnail Image</label>
        <input
          type="file"
          accept="image/*"
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          onChange={handleThumbnailChange}
        />
        {thumbnailPreview && (
          <div className='relative mb-4'>
            <img src={thumbnailPreview} alt="Thumbnail Preview" className='w-24 h-24 object-cover m-2 rounded-lg shadow-md' />
            <button
              type="button"
              className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2'
              onClick={() => {
                setThumbnailImage(null);
                setThumbnailPreview('');
              }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Additional Features */}
        <label className='mb-2 font-semibold'>Additional Features</label>
        <div className='flex mb-4'>
          <input
            type='text'
            className='border-2 border-gray-300 p-2 rounded-lg flex-grow'
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            placeholder='Enter a feature'
          />
          <button
            type="button"
            className='ml-2 bg-green-500 text-white rounded-lg p-2 hover:bg-green-700'
            onClick={handleAddFeature}
          >
            Add
          </button>
        </div>
        {additionalFeatures.length > 0 && (
          <ul className='mb-4'>
            {additionalFeatures.map((feature, index) => (
              <li key={index} className='flex justify-between items-center mb-2'>
                {feature}
                <button
                  type="button"
                  className='ml-2 bg-red-500 text-white rounded-lg p-2 hover:bg-red-700'
                  onClick={() => handleRemoveFeature(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className='border-2 rounded-lg text-white bg-blue-500 hover:bg-blue-700 p-4 transition duration-300'
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default AddNewVehicle;
