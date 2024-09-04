import React, { useState } from 'react';
import './homepage.css';
import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import card1Image from './Assets/Card 1.png'
import card2Image from './Assets/Card 2.png'
import card3Image from './Assets/Card 3.png'
import card4Image from './Assets/Card 4.png'
import card5Image from './Assets/Card 5.png'

function Home() {
  / State to manage modal visibility
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  const handleImageClick = (imageUrl) => {
    setModalImageSrc(imageUrl);  // Set the image source
    setModalVisible(true);       // Show the modal
  };

  const handleCloseModal = () => {
    setModalVisible(false);      // Hide the modal
  };
  
  // State for managing the selected category
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Example card data with categories
  const cards = [
    { id: 1, title: 'Confetti Fun', category: 'Fun' },
    { id: 2, title: 'Georgia Tech Theme', category: 'Professional' },
    { id: 3, title: 'Computer Thanks', category: 'Tech' },
    { id: 4, title: 'Sunny Day', category: 'Seasonal' },
    { id: 5, title: '1332 Thanks', category: 'Academic' },
  ];

  // Filter the cards based on the selected category
  const filteredCards = selectedCategory === 'All'
    ? cards
    : cards.filter(card => card.category === selectedCategory);
  const navigate = useNavigate();
  return (
    
    <div className="App">
      <div className="header">
        <div className="title">2 of 3: Select Card</div>
        <div className="search"> <button onClick={() => navigate('/')} >Search</button> </div>
      </div>

      {/* Filter dropdown */}
      <div className="filter-container">
        <label>Filter by Category: </label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Fun">Fun</option>
          <option value="Professional">Professional</option>
          <option value="Tech">Tech</option>
          <option value="Seasonal">Seasonal</option>
          <option value="Academic">Academic</option>
        </select>
      </div>
      

      {/* Cards container */}
      <div className="cards-container">
        <div className="card card-1" onClick={() => handleImageClick(card1Image)}>
          <div className="card-image"></div>
          <div className="card-title">Confetti Fun</div> 
        </div>
        <div className="card card-2" onClick={() => handleImageClick(card2Image)}>
          <div className="card-image"></div>
          <div className="card-title">Georgia Tech Theme</div>
        </div>
        <div className="card card-3" onClick={() => handleImageClick(card3Image)}>
          <div className="card-image"></div>
          <div className="card-title">Computer Thanks</div>
        </div>
        <div className="card card-4" onClick={() => handleImageClick(card4Image)}>
          <div className="card-image"></div>
          <div className="card-title">Sunny Day</div>
        </div>
        <div className="card card-5" onClick={() => handleImageClick(card5Image)}>
          <div className="card-image"></div>
          <div className="card-title">1332 Thanks</div>
        </div>
      </div>
      {/* Modal for previewing images */}
      {isModalVisible && (
        <div id="image-modal" className="image-modal">
          <span className="close-modal" onClick={handleCloseModal}>&times;</span>
          <img id="modal-image" className="modal-content" src={modalImageSrc} alt="" />
        </div>
      )}
    </div>
  );
}

export default Home;
