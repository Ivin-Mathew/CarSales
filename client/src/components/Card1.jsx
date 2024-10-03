// Card1.js

import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Card1 = ({ img, title, text, id }) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(img);

  useEffect(() => {
    console.log('Card1 Props:', { img, title, text });
  }, [img, title, text]);

  const handleCardClick = () => {
    console.log(`Navigating to car details for: ${title}`);
    navigate(`/carDetails/${id}`, { state: { img, title, text } });
  };

  const handleImageError = () => {
    console.log(`Image failed to load for: ${title}`);
    setImgSrc('https://via.placeholder.com/400x300?text=No+Image');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick();
    }
  };

  return (
    <div
      className="w-full max-w-sm min-h-[18rem] border-2 border-black mb-5 rounded-xl hover:cursor-pointer hover:shadow-lg hover:scale-105 transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex="0"
      aria-label={`View details for ${title}`}
    >
      <img
        src={imgSrc}
        alt={`Image of ${title}`}
        className="rounded-t-xl shadow-lg object-cover w-full h-48"
        onError={handleImageError}
      />
      <div className="p-4">
        <h1 className="font-semibold text-2xl">{title}</h1>
        <p className="text-gray-600">₹{Number(text).toLocaleString()}</p>
      </div>
    </div>
  );
};

Card1.propTypes = {
  img: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  id:PropTypes.string.isRequired,
};

export default Card1;
