import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const DealershipProfile = () => {
  const [dealershipName, setDealershipName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [message, setMessage] = useState(null);

  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        const userDoc = doc(db, 'dealershipsInfo', user.email);
        setUserEmail(user.email);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setDealershipName(data.dealershipName);
          setOwnerName(data.ownerName);
          setContactNumber(data.contactNumber);
          setWhatsappNumber(data.whatsappNumber);
          setEmail(data.email);
          setDistrict(data.district);
          setLocation(data.location);
          setPincode(data.pincode);
        } else {
          navigate("/");
        }
      }
    });
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!dealershipName || !ownerName || !contactNumber || !whatsappNumber || !email || !district || !location || !pincode) {
      alert('All fields are mandatory');
      return;
    }

    const db = getFirestore();
    try {
      setLoading(true);
      await setDoc(doc(db, 'dealershipsInfo', userEmail), {
        dealershipName,
        ownerName,
        contactNumber,
        whatsappNumber,
        email,
        district,
        location,
        pincode,
        isProfileCompleted: true, // Explicitly set to true
      }, { merge: true }); // Use merge to update only the specified fields
      setIsEditing(false);
      setIsSaved(true);
      setLoading(false);
      setMessage({ type: 'success', text: 'Data has been saved successfully!' });
      setTimeout(() => {
        navigate("/dealership/dashboard"); // Redirect to dashboard after saving
      }, 2000); // Delay to show the success message
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Error saving profile. Please try again.' });
      console.error("Error saving profile:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSaved(false);
  };

  return (
    <div className='flex flex-col justify-center items-center bg-gray-100 p-6 '>
      <h1 className='text-4xl font-bold mb-6'>Dealership Profile</h1>
      <form className='flex flex-col bg-white p-6 rounded-lg shadow-lg min-w-[50%]' onSubmit={handleSave}>
        <label className='mb-2 font-semibold'>Dealership Name</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='Dealership Name'
          value={dealershipName}
          onChange={(e) => setDealershipName(e.target.value)}
          disabled={!isEditing}
        />
        <label className='mb-2 font-semibold'>Owner Name</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='Owner Name'
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          disabled={!isEditing}
        />
        <label className='mb-2 font-semibold'>Contact Number</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='Contact Number'
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          maxLength={10}
          disabled={!isEditing}
        />
        <label className='mb-2 font-semibold'>WhatsApp Number</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='WhatsApp Number'
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          maxLength={10}
          disabled={!isEditing}
        />
        <label className='mb-2 font-semibold'>Email</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!isEditing}
        />
        <label className='mb-2 font-semibold'>Location</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='Location'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={!isEditing}
        />
        <label className='mb-2 font-semibold'>District</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='District'
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          disabled={!isEditing}
        />
        <label className='mb-2 font-semibold'>Pincode</label>
        <input
          className='border-2 border-gray-300 mb-4 p-2 rounded-lg'
          placeholder='Pincode'
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          maxLength={6}
          disabled={!isEditing}
        />
        <div className='flex justify-between'>
          <button
            className='border-2 rounded-lg text-white bg-green-500 hover:bg-green-700 p-4'
            type="button"
            onClick={handleEdit}
            disabled={isEditing}
          >
            Edit
          </button>
          <button
            className='border-2 rounded-lg text-white bg-blue-500 hover:bg-blue-700 p-4'
            type="submit"
            disabled={!isEditing || loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      {message && (
        <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default DealershipProfile;