/* // firestoreService.js
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const fetchVehiclesFromFirestore = async () => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const dealerID = user.uid;
  console.log(dealerID);
  const q = query(collection(db, 'cars'), where('dealerID', '==', dealerID));
  const querySnapshot = await getDocs(q);

  const vehicles = [];
  querySnapshot.forEach((doc) => {
    vehicles.push({ id: doc.id, ...doc.data() });
  });

  return vehicles;
}; */