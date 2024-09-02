import React, { useState } from 'react';
import './homepage.css';

function App() {
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

  return (
    <div className="App">
      <div className="header">
        <div className="title">2 of 3: Select Card</div>
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
        {filteredCards.map(card => (
          <div key={card.id} className={`card card-${card.id}`}>
            <div className="card-image"></div>
            <div className="card-title">{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
