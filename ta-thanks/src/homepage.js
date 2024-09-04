import React, { useState } from 'react';
import './homepage.css';
import card1Image from './Assets/Card 1.png'
import card2Image from './Assets/Card 2.png'
import card3Image from './Assets/Card 3.png'
import card4Image from './Assets/Card 4.png'
import card5Image from './Assets/Card 5.png'

function App() {
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

  return (
    <div className="App">
      <div className="header">
        <div className="title">2 of 3: Select Card</div>
      </div>
      

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

export default App;
