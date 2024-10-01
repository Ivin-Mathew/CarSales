import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Navbar from '../components/Navbar';
import Card1 from '../components/Card1';

const CarSales = () => {
  const [filters, setFilters] = useState(['Maruthi', 'Power steering', 'Rear cam']);
  const [budget, setBudget] = useState([10000, 2000000]);
  const [newFilter, setNewFilter] = useState('');
  const [mainFilters, setMainFilters] = useState(['New', 'Price Ascending', 'Price Descending', 'Rating']);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('New');
  const [checkboxes, setCheckboxes] = useState({
    basicDetails: {
      'insurance': true,
      'no accident': true,
    },
    owners: {
      '1st': true,
      '2nd': true,
      '3rd': true,
    },
    fuel: {
      Petrol: true,
      Diesel: true,
      CNG: true,
    },
  });
  const [filteredCars, setFilteredCars] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [page, setPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    fetchCars();
  }, [location.search, budget, checkboxes]);

  const fetchCars = async () => {
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query') || '';

    let carQuery = query(
      collection(db, 'cars'),
      where('hidden', '==', false),
      orderBy('priority'),
      limit(20)
    );

    if (searchTerm) {
      carQuery = query(
        collection(db, 'cars'),
        where('hidden', '==', false),
        where('carName', '>=', searchTerm),
        where('carName', '<=', searchTerm + '\uf8ff'),
        orderBy('carName'),
        orderBy('priority'),
        limit(20)
      );
    }

    // Apply budget filter
    carQuery = query(
      carQuery,
      where('carPrice', '>=', budget[0]),
      where('carPrice', '<=', budget[1])
    );

    // Apply basic details filter
    if (checkboxes.basicDetails.insurance) {
      carQuery = query(carQuery, where('insurance', '==', true));
    }
    if (checkboxes.basicDetails['no accident']) {
      carQuery = query(carQuery, where('noAccident', '==', true));
    }

    // Apply owners filter
    const ownersFilters = Object.keys(checkboxes.owners).filter(key => checkboxes.owners[key]);
    if (ownersFilters.length > 0) {
      carQuery = query(carQuery, where('ownersNum', 'in', ownersFilters.map(owner => parseInt(owner))));
    }

    // Apply fuel filter
    const fuelFilters = Object.keys(checkboxes.fuel).filter(key => checkboxes.fuel[key]);
    if (fuelFilters.length > 0) {
      carQuery = query(carQuery, where('carFuel', 'in', fuelFilters));
    }

    const carSnapshot = await getDocs(carQuery);
    const cars = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFilteredCars(cars);
    setLastVisible(carSnapshot.docs[carSnapshot.docs.length - 1]);
  };

  const handleSliderChange = value => {
    setBudget(value);
  };

  const handleAddFilter = (e) => {
    e.preventDefault();
    if (newFilter.trim()) {
      setFilters([...filters, newFilter.trim()]);
      setNewFilter('');
    }
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
  }

  const handleRemoveFilter = filter => {
    setFilters(filters.filter(f => f !== filter));
  };

  const handleCheckboxChange = (group, checkbox) => {
    setCheckboxes({
      ...checkboxes,
      [group]: {
        ...checkboxes[group],
        [checkbox]: !checkboxes[group][checkbox],
      },
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?query=${search}`);
  };

  const handleNextPage = async () => {
    let carQuery = query(
      collection(db, 'cars'),
      where('hidden', '==', false),
      orderBy('priority'),
      startAfter(lastVisible),
      limit(20)
    );

    const carSnapshot = await getDocs(carQuery);
    const cars = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFilteredCars(cars);
    setLastVisible(carSnapshot.docs[carSnapshot.docs.length - 1]);
    setPage(page + 1);
  };

  const handlePreviousPage = async () => {
    if (page > 1) {
      let carQuery = query(
        collection(db, 'cars'),
        where('hidden', '==', false),
        orderBy('priority'),
        limit(20 * (page - 1))
      );

      const carSnapshot = await getDocs(carQuery);
      const cars = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFilteredCars(cars.slice(-20));
      setLastVisible(carSnapshot.docs[carSnapshot.docs.length - 1]);
      setPage(page - 1);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex p-5">
        <div className="w-1/5 pr-5 flex flex-col m-1 border-2 border-[#bcbcbc] rounded-md p-4">
          <div>
            {filters.map((filter, index) => (
              <div key={index} className=' m-2 bg-gray-200 rounded px-1 flex-row flex w-fit'>
                <span className="">
                  {filter}
                </span>
                <div onClick={() => handleRemoveFilter(filter)} className='text-md  hover:cursor-pointer text-start ml-2'>&times;</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddFilter} className='flex my-4'>
            <input
              type="text"
              value={newFilter}
              onChange={e => setNewFilter(e.target.value)}
              placeholder="Type filters"
              className="p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleAddFilter}
              className="ml-2 bg-black text-white rounded"
            >
              Add Filter
            </button>
          </form>
          
          <div className="mb-4">
            <p className='mb-1'>Basic Details</p>
            {Object.keys(checkboxes.basicDetails).map(key => (
              <label className="block mb-1" key={key}>
                <input
                  type="checkbox"
                  checked={checkboxes.basicDetails[key]}
                  onChange={() => handleCheckboxChange('basicDetails', key)}
                  className="mr-1 accent-black h-3"
                />{' '}
                {key}
              </label>
            ))}
          </div>
          <div className="mb-4">
            <p>Budget ₹{budget[0]} - ₹{budget[1]}</p>
            <Slider
              trackStyle={{ backgroundColor: '#000' }}
              range
              min={10000}
              max={2000000}
              value={budget}
              onChange={handleSliderChange}
              defaultValue={[10000, 2000000]}
              handleStyle={{
                borderColor: '#000',
              }}
            />
          </div>
          <div className="mb-4">
            <p className='mb-1'>Owners</p>
            {Object.keys(checkboxes.owners).map(key => (
              <label className="block mb-1" key={key}>
                <input
                  type="checkbox"
                  checked={checkboxes.owners[key]}
                  onChange={() => handleCheckboxChange('owners', key)}
                  className="mr-1 accent-black h-3"
                />{' '}
                {key}
              </label>
            ))}
          </div>
          <div className="mb-4">
            <p className='mb-1'>Fuel</p>
            {Object.keys(checkboxes.fuel).map(key => (
              <label className="block mb-1" key={key}>
                <input
                  type="checkbox"
                  checked={checkboxes.fuel[key]}
                  onChange={() => handleCheckboxChange('fuel', key)}
                  className="mr-1 accent-black h-3"
                />{' '}
                {key}
              </label>
            ))}
          </div>
        </div>
        <div className="w-4/5 pl-5">
          <div className="flex flex-row justify-between">
            <form onSubmit={handleSearch} className='w-2/3'>
              <input
                type="text"
                placeholder="Search"
                className="w-3/4 py-2 px-4 h-fit rounded-3xl border border-gray-300"
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            
            <div className="flex justify-start space-x-4 mb-4">
              {mainFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterClick(filter)}
                  className={`p-2 h-fit rounded ${selectedFilter === filter ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {filteredCars.map((car, index) => (
              <div key={index}>
                <Card1 img={car.thumbnailImg} title={car.carName} text={`₹${car.carPrice}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousPage}
              className="bg-gray-300 text-black p-2 rounded"
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              className="bg-gray-300 text-black p-2 rounded"
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