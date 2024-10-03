import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Card1 from '../components/Card1';

const CarSales = () => {
  // State variables
  const [search, setSearch] = useState('');
  const [filteredCars, setFilteredCars] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const db = getFirestore();

  // Synchronize search state with URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query') || '';
    setSearch(searchTerm);
  }, [location.search]);

  // Fetch cars whenever location.search changes
  useEffect(() => {
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchCars = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query') || '';
    const searchTermLower = searchTerm.toLowerCase(); // Convert to lowercase for consistency

    console.log('Fetching cars with search term:', searchTerm);

    let carQuery;

    if (searchTerm) {
      // Perform prefix search on carNameLower
      carQuery = query(
        collection(db, 'carDetails'),
        where('hidden', '==', false),
        where('carNameLower', '>=', searchTermLower),
        where('carNameLower', '<=', searchTermLower + '\uf8ff'),
        orderBy('carNameLower'),
        orderBy('priority', 'desc'),
        limit(20)
      );
    } else {
      // Default query without search
      carQuery = query(
        collection(db, 'carDetails'),
        where('hidden', '==', false),
        orderBy('priority', 'desc'),
        limit(20)
      );
    }

    try {
      const carSnapshot = await getDocs(carQuery);
      if (carSnapshot.empty) {
        console.log('No matching documents.');
        setFilteredCars([]); // Clear previous results
      } else {
        let cars = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log('Fetched cars:', cars); // Log fetched cars
        setFilteredCars(cars);
        setLastVisible(carSnapshot.docs[carSnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setFilteredCars([]); // Clear previous results on error
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Handlers
  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    // Encode the search term to handle special characters
    navigate(`/search?query=${encodeURIComponent(search)}`);
  }, [search, navigate]);

  // Pagination Handlers
  const handleNextPage = async () => {
    if (!lastVisible) return; // Prevent fetching if there's no lastVisible

    setLoading(true);
    let carQuery;

    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query') || '';
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTerm) {
      carQuery = query(
        collection(db, 'carDetails'),
        where('hidden', '==', false),
        where('carNameLower', '>=', searchTermLower),
        where('carNameLower', '<=', searchTermLower + '\uf8ff'),
        orderBy('carNameLower'),
        orderBy('priority', 'desc'),
        startAfter(lastVisible),
        limit(20)
      );
    } else {
      carQuery = query(
        collection(db, 'carDetails'),
        where('hidden', '==', false),
        orderBy('priority', 'desc'),
        startAfter(lastVisible),
        limit(20)
      );
    }

    try {
      const carSnapshot = await getDocs(carQuery);
      if (carSnapshot.empty) {
        console.log('No more matching documents.');
      } else {
        const cars = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched cars:', cars); // Log fetched cars

        setFilteredCars(prevCars => [...prevCars, ...cars]);
        setLastVisible(carSnapshot.docs[carSnapshot.docs.length - 1]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handlePreviousPage = async () => {
    if (page <= 1) return; // Prevent going below page 1

    setLoading(true);
    let carQuery;

    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query') || '';
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTerm) {
      carQuery = query(
        collection(db, 'carDetails'),
        where('hidden', '==', false),
        where('carNameLower', '>=', searchTermLower),
        where('carNameLower', '<=', searchTermLower + '\uf8ff'),
        orderBy('carNameLower'),
        orderBy('priority', 'desc'),
        limit(20 * (page - 1))
      );
    } else {
      carQuery = query(
        collection(db, 'carDetails'),
        where('hidden', '==', false),
        orderBy('priority', 'desc'),
        limit(20 * (page - 1))
      );
    }

    try {
      const carSnapshot = await getDocs(carQuery);
      if (carSnapshot.empty) {
        console.log('No matching documents.');
      } else {
        const cars = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched cars:', cars); // Log fetched cars

        setFilteredCars(cars.slice(-20)); // Get the last 20 items for the previous page
        setLastVisible(carSnapshot.docs[carSnapshot.docs.length - 1]);
        setPage(prevPage => prevPage - 1);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Render the component
  return (
    <div>
      <Navbar />
      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}
      <div className={`flex p-5 ${loading ? 'opacity-50' : ''}`}>
        {/* Main Content */}
        <div className="w-full pl-5">
          {/* Search Form */}
          <div className="flex flex-row justify-between mb-4">
            <form onSubmit={handleSearchSubmit} className='w-full flex items-center'>
              <input
                type="text"
                placeholder="Search by car name"
                className="w-full py-2 px-4 h-fit rounded-3xl border border-gray-300"
                value={search}
                onChange={handleSearchChange}
                required
              />
              <button
                type="submit"
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
              >
                Search
              </button>
            </form>
          </div>

          {/* Car Listings */}
          <div className="flex flex-wrap gap-4">
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <div key={car.id}>
                  <Card1 img={car.thumbnailImg} title={car.carName} text={`₹${car.carPrice}`} id={car.id} />
                </div>
              ))
            ) : (
              <p>No cars match your search criteria.</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousPage}
              className="bg-gray-300 text-black p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              className="bg-gray-300 text-black p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarSales;