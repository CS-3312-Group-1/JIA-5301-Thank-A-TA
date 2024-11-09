import React, { useState } from 'react';
import './taInbox.css';
import { useNavigate } from 'react-router-dom';
import homeIcon from './Assets/Vector.png';
import Card1 from './Assets/Card 1.png'; // Blue card
import Card2 from './Assets/Card 2.png'; // Gold card
import Card3 from './Assets/Card 3.png'; // Red card
import Card4 from './Assets/Card 4.png'; // Yellow card
import Card5 from './Assets/Card 5.png'; // Blue card

function TaInbox() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedColor, setSelectedColor] = useState('All');
    const navigate = useNavigate();
    
    const colors = ['Red', 'Gold', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Gray', 'Black', 'Brown'];

    // Dummy card data using imported images
    const dummyCards = [
        { _id: 1, image: Card1, title: "Blue Card 1", category: "Fun", color: "Blue" },
        { _id: 2, image: Card2, title: "Gold Card", category: "Professional", color: "Gold" },
        { _id: 3, image: Card3, title: "Red Card", category: "Tech", color: "Red" },
        { _id: 4, image: Card4, title: "Yellow Card", category: "Seasonal", color: "Yellow" },
        { _id: 5, image: Card5, title: "Blue Card 2", category: "Academic", color: "Blue" }
    ];

    // Filter the dummy cards based on the selected category and color
    const filteredCards = dummyCards
        .filter(card => selectedCategory === 'All' || card.category === selectedCategory)
        .filter(card => selectedColor === 'All' || card.color === selectedColor);

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

            <div className="main-content">
                {/* Filters Section */}
                <div className="filters">
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

                    <div className="reset-filters">
                        <button onClick={() => {
                            setSelectedCategory('All');
                            setSelectedColor('All');
                        }}>
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Card Display Section */}
                <div className="card-display">
                    {filteredCards.map(card => (
                        <div key={card._id} className="card">
                            <img src={card.image} alt={`${card.title}`} />
                            <h3>{card.title}</h3>
                            <p>Category: {card.category}</p>
                            <p>Color: {card.color}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TaInbox;
