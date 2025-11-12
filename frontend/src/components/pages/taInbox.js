/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/taInbox.css';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../../assets/Vector.png';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../../apiConfig';

function TaInbox() {
    // State for modal
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);

    // State for filtering
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedColor, setSelectedColor] = useState('All');
    const [cards, setCards] = useState([]); // Store cards from DB
    const navigate = useNavigate();

    // New states for class and category filters
    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // List of colors for the color filter
    const colors = ['Red', 'Gold', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Gray', 'Black', 'Brown'];

    // Context to get the current user's email
    const { userEmail } = useUser(); 

    // Fetch cards for a specific TA from the database
    useEffect(() => {
        const fetchCards = async () => {
            if (!userEmail) return;

            try {
                // Fetch cards directly using the TA's email
                const cardsResponse = await axios.get(`${API_BASE_URL}/cards/${userEmail}`);
                const fetchedCards = cardsResponse.data;
                setCards(fetchedCards);

                // Extract unique classes and categories
                const uniqueClasses = [...new Set(fetchedCards.map(card => card.fromClass).filter(Boolean))];
                setAvailableClasses(uniqueClasses);

                const uniqueCategories = [...new Set(fetchedCards.map(card => card.category).filter(Boolean))];
                setAvailableCategories(uniqueCategories);

            } catch (error) {
                console.error("Error fetching cards:", error);
            }
        };
        fetchCards();
    }, [userEmail]);

    // Filter the cards based on the selected category, color, and new class/category filters
    const filteredCards = cards
        .filter(card => selectedCategory === 'All' || card.category === selectedCategory)
        .filter(card => selectedColor === 'All' || card.color === selectedColor)
        .filter(card => selectedClasses.length === 0 || selectedClasses.includes(card.fromClass))
        .filter(card => selectedCategories.length === 0 || selectedCategories.includes(card.category));

    const handleImageClick = (imageUrl, card) => {
        setModalImageSrc(imageUrl);
        setModalVisible(true);
        setSelectedCard(card);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const [sortOrder, setSortOrder] = useState('ascending'); // Default: ascending

    const sortedCards = [...filteredCards];
    if (sortOrder === 'descending') {
        sortedCards.reverse();
    }    

    const handleClassFilterChange = (e) => {
        const { value, checked } = e.target;
        setSelectedClasses(prev => 
            checked ? [...prev, value] : prev.filter(c => c !== value)
        );
    };

    const handleCategoryFilterChange = (e) => {
        const { value, checked } = e.target;
        setSelectedCategories(prev => 
            checked ? [...prev, value] : prev.filter(c => c !== value)
        );
    };

    return (
        <div className="App">
            <div className="header">
                <div className="title">TA Thank You Cards</div>
                <div className="search">
                    <button onClick={() => {
                        sessionStorage.clear();
                        navigate('/login');
                    }}>Logout</button>
                </div>
            </div>

            <div className="main-contenti">
                {/* Filters Section */}
                <div className="filtersi">
                    {/* Sort by Date */}
                    <div className="sort-filter">
                        <label htmlFor="sortOrder" className="sort-label">Sort by Date: </label>
                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="custom-dropdown"
                        >
                            <option value="ascending">Oldest First</option>
                            <option value="descending">Newest First</option>
                        </select>
                    </div>

                    {/* Filter by Class */}
                    <div className="filter-group">
                        <h3>Filter by Class</h3>
                        {availableClasses.map(cls => (
                            <label key={cls}>
                                <input
                                    type="checkbox"
                                    value={cls}
                                    checked={selectedClasses.includes(cls)}
                                    onChange={handleClassFilterChange}
                                />
                                {cls}
                            </label>
                        ))}
                    </div>

                    {/* Filter by Category */}
                    <div className="filter-group">
                        <h3>Filter by Category</h3>
                        {availableCategories.map(cat => (
                            <label key={cat}>
                                <input
                                    type="checkbox"
                                    value={cat}
                                    checked={selectedCategories.includes(cat)}
                                    onChange={handleCategoryFilterChange}
                                />
                                {cat}
                            </label>
                        ))}
                    </div>

                    <div className="reseti-filters">
                        <button onClick={() => {
                            setSelectedCategory('All');
                            setSelectedColor('All');
                            setSelectedClasses([]);
                            setSelectedCategories([]);
                        }}>
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Card Display Section */}
                <div className="cardi-display">
                    {sortedCards.map((card, index) => (
                        <div key={card._id || index} className="cardi">
                            <img 
                                src={card.data} 
                                alt={`Card ${index + 1}`} 
                                onClick={() => handleImageClick(card.data, card)} 
                                style={{ cursor: 'pointer' }}
                            />
                            <p>From: {card.fromName}</p>
                            <p>Class: {card.fromClass}</p>
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