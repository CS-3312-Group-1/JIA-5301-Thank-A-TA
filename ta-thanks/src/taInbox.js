import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './taInbox.css';
import { useNavigate } from 'react-router-dom';
import homeIcon from './Assets/Vector.png';

function TaInbox({ taId }) {
    // State for modal
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);

    // State for filtering
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedColor, setSelectedColor] = useState('All');
    const [cards, setCards] = useState([]); // Store cards from DB
    const navigate = useNavigate();

    const colors = ['Red', 'Gold', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Gray', 'Black', 'Brown'];

    taId = 'jessierigsbee@gmail';

    // Fetch cards for a specific TA from the database
    useEffect(() => {
        axios.get(`http://localhost:3001/cards/jessierigsbee@gmail.com`)
            .then((response) => {
                setCards(response.data);
                console.log(cards);
            })
            .catch((error) => {
                console.error("Error fetching cards:", error);
            });
    }, [taId]);

    // Filter the cards based on the selected category and color
    const filteredCards = cards
        .filter(card => selectedCategory === 'All' || card.category === selectedCategory)
        .filter(card => selectedColor === 'All' || card.color === selectedColor);

    const handleImageClick = (imageUrl, card) => {
        setModalImageSrc(imageUrl);
        setModalVisible(true);
        setSelectedCard(card);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    return (
        <div className="App">
            <div className="header">
                <div className="title">TA Thank You Cards</div>
                <div className="search">
                    <button onClick={() => navigate('/')}>
                        <img src={homeIcon} alt="Home" />
                    </button>
                </div>
            </div>

            <div className="main-contenti">
                {/* Filters Section */}
                <div className="filtersi">
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

                    {/* Color Filter */}
                    <div className="color-filter">
                        <label>Filter by Color: </label>
                        <div className="color-options">
                            {colors.map((color, index) => (
                                <div
                                    key={index}
                                    className={`color-circle ${selectedColor === color ? 'selected' : ''} ${color.toLowerCase()}`}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="reseti-filters">
                        <button onClick={() => {
                            setSelectedCategory('All');
                            setSelectedColor('All');
                        }}>
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Card Display Section */}
                <div className="cardi-display">
                    {filteredCards.map((card, index) => (
                        <div key={card._id || index} className="cardi">
                            <img 
                                src={card.data} 
                                alt={`Card ${index + 1}`} 
                                onClick={() => handleImageClick(card.data, card)} 
                                style={{ cursor: 'pointer' }}
                            />
                            <h3>{card.title}</h3>
                            <p>Category: {card.category}</p>
                            <p>Color: {card.color}</p>
                        </div>
                    ))}
                </div>

                {/* Modal for card image */}
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

export default TaInbox;
