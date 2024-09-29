import { useState } from 'react';
import { getFirestore, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AddNewVehicle = () => {
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
    const names = files.map((file) => file.name);
    setImageNames([...imageNames, ...names]);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newNames = imageNames.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    setImageNames(newNames);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailImage(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setAdditionalFeatures([...additionalFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = additionalFeatures.filter((_, i) => i !== index);
    setAdditionalFeatures(newFeatures);
  };

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
      // Add initial car details to Firestore to get the carDetailsRef
      const carDetailsRef = doc(collection(db, 'carDetails'), dealerID);
      await setDoc(carDetailsRef, {
        carVIN,
        carName,
        carCompany,
        carPrice,
        manufacturedYear,
        carDesc,
        carType,
        carColor,
        carFuel,
        ownersNum,
        carTransmission,
        engineCap,
        seatCap,
        carCondition,
        location,
        additionalFeatures,
        dealerID,
      });

      const carDetailsId = carDetailsRef.id;

      // Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const imageRef = ref(storage, `cars/${carDetailsId}/${image.name}`);
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );

      // Upload thumbnail image to Firebase Storage
      let thumbnailUrl = '';
      if (thumbnailImage) {
        const thumbnailRef = ref(storage, `cars/${carDetailsId}/thumbnail_${thumbnailImage.name}`);
        await uploadBytes(thumbnailRef, thumbnailImage);
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      }

      // Update car details with image URLs and thumbnail URL
      await updateDoc(carDetailsRef, {
        images: imageUrls,
        thumbnailImg: thumbnailUrl,
      });

      // Add record to cars collection
      await setDoc(doc(collection(db, 'cars'), carDetailsId), {
        carID: carDetailsId,
        dealerID,
        carName,
        carPrice,
        priority : 0, // Default priority
        hidden : false,
        ownersNum,
        carFuel,
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
      <form className='flex flex-col bg-white p-6 rounded-lg shadow-lg min-w-[50%]' onSubmit={handleSubmit}>
        <label className='mb-2 font-semibold'>Car VIN</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carVIN} onChange={(e) => setCarVIN(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Name</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carName} onChange={(e) => setCarName(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Company</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carCompany} onChange={(e) => setCarCompany(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Price</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carPrice} onChange={(e) => setCarPrice(e.target.value)} required />
        <label className='mb-2 font-semibold'>Manufactured Year</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={manufacturedYear} onChange={(e) => setManufacturedYear(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Description</label>
        <textarea className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carDesc} onChange={(e) => setCarDesc(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Model</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carType} onChange={(e) => setCarType(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Color</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carColor} onChange={(e) => setCarColor(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Fuel</label>
        <select className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carFuel} onChange={(e) => setCarFuel(e.target.value)} required>
          <option value="">Select Fuel Type</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="petrolHybrid">Petrol Hybrid</option>
          <option value="dieselHybrid">Diesel Hybrid</option>
          <option value="electric">Electric</option>
        </select>
        <label className='mb-2 font-semibold'>Number of Previous Owners</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={ownersNum} onChange={(e) => setOwnersNum(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Transmission</label>
        <select className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carTransmission} onChange={(e) => setCarTransmission(e.target.value)} required>
          <option value="">Select Transmission</option>
          <option value="manual">Manual</option>
          <option value="amt">AMT</option>
          <option value="cvt">CVT</option>
          <option value="electric">Electric</option>
        </select>
        <label className='mb-2 font-semibold'>Engine Capacity</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={engineCap} onChange={(e) => setEngineCap(e.target.value)} required />
        <label className='mb-2 font-semibold'>Seating Capacity</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={seatCap} onChange={(e) => setSeatCap(e.target.value)} required />
        <label className='mb-2 font-semibold'>Car Condition</label>
        <select className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={carCondition} onChange={(e) => setCarCondition(e.target.value)} required>
          <option value="">Select Condition</option>
          <option value="poor">Poor</option>
          <option value="average">Average</option>
          <option value="good">Good</option>
          <option value="excellent">Excellent</option>
        </select>
        <label className='mb-2 font-semibold'>Location</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' value={location} onChange={(e) => setLocation(e.target.value)} required />
        <label className='mb-2 font-semibold'>Images</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' type="file" multiple onChange={handleImageChange} />
        <div className='flex flex-wrap mb-4'>
          {imagePreviews.map((src, index) => (
            <div key={index} className='relative'>
              <img src={src} alt={`Preview ${index}`} className='w-24 h-24 object-cover m-2' />
              <button type="button" className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1' onClick={() => handleRemoveImage(index)}>X</button>
            </div>
          ))}
        </div>
        <ul className='mb-4'>
          {imageNames.map((name, index) => (
            <li key={index} className='flex justify-between items-center mb-2'>
              {name}
            </li>
          ))}
        </ul>
        <label className='mb-2 font-semibold'>Thumbnail Image</label>
        <input className='border-2 border-gray-300 mb-4 p-2 rounded-lg' type="file" onChange={handleThumbnailChange} />
        {thumbnailPreview && (
          <div className='relative mb-4'>
            <img src={thumbnailPreview} alt="Thumbnail Preview" className='w-24 h-24 object-cover m-2' />
          </div>
        )}
        <label className='mb-2 font-semibold'>Additional Features</label>
        <div className='flex mb-4'>
          <input className='border-2 border-gray-300 p-2 rounded-lg flex-grow' value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} />
          <button type="button" className='ml-2 border-2 rounded-lg text-white bg-green-500 hover:bg-green-700 p-2' onClick={handleAddFeature}>Add</button>
        </div>
        <ul className='mb-4'>
          {additionalFeatures.map((feature, index) => (
            <li key={index} className='flex justify-between items-center mb-2'>
              {feature}
              <button type="button" className='ml-2 border-2 rounded-lg text-white bg-red-500 hover:bg-red-700 p-2' onClick={() => handleRemoveFeature(index)}>Remove</button>
            </li>
          ))}
        </ul>
        <button className='border-2 rounded-lg text-white bg-blue-500 hover:bg-blue-700 p-4' type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default AddNewVehicle;