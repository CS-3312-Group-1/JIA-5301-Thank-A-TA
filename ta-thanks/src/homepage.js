import React, { useState } from 'react';
import './homepage.css';
import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import card1Image from './Assets/Card 1.png'
import card2Image from './Assets/Card 2.png'
import card3Image from './Assets/Card 3.png'
import card4Image from './Assets/Card 4.png'
import card5Image from './Assets/Card 5.png'
import homeIcon from './Assets/Vector.png'

function Home() {
  // State to manage modal visibility
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

  // Example card data with categories and images
  const cards = [
    { id: 1, title: 'Confetti Fun', category: 'Fun', image: card1Image },
    { id: 2, title: 'Georgia Tech Theme', category: 'Professional', image: card2Image },
    { id: 3, title: 'Computer Thanks', category: 'Tech', image: card3Image },
    { id: 4, title: 'Sunny Day', category: 'Seasonal', image: card4Image },
    { id: 5, title: '1332 Thanks', category: 'Academic', image: card5Image },
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
        <div className="search"><button onClick={() => navigate('/')}> <img src={homeIcon} alt="Search" /></button></div>
      </div>

      {/* Main layout container */}
      <div className="main-content">
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
          {filteredCards.map(card => (
            <div key={card.id} className={`card card-${card.id}`} onClick={() => handleImageClick(card.image)}>
              <div className="card-image">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="card-title">{card.title}</div> 
            </div>
          ))}
        </div>

        {/* Modal for previewing images */}
        {isModalVisible && (
          <div id="image-modal" className="image-modal">
            <span className="close-modal" onClick={handleCloseModal}>&times;</span>
            <img id="modal-image" className="modal-content" src={modalImageSrc} alt="" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

