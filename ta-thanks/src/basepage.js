import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import html2canvas from 'html2canvas';
import Draggable from 'react-draggable'; 
import "./basepage.css";
import homeIcon from './Assets/Vector.png';
import emptyCard1 from './Assets/card1_Empty.png';
import emptyCard2 from './Assets/card2_Empty.png';
import emptyCard3 from './Assets/Card3_Empty.png';
import emptyCard4 from './Assets/card4_Empty.png';
import emptyCard5 from './Assets/card5_Empty.png';
import emailjs from 'emailjs-com';
import axios from "axios";

function BasePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedCard } = location.state || {};  // Retrieve card data from the router state
    const { selectedTAEmail } = location.state || {};
    const [text, setText] = useState(''); // State to store the user's message
    const [textBoxes, setTextBoxes] = useState([]); // Store multiple draggable text boxes
    const [selectedBoxId, setSelectedBoxId] = useState(null); // Track the currently selected text box
    const [previewTextSize, setPreviewTextSize] = useState(20); // Manage preview text size for new text boxes
    const [textColor, setTextColor] = useState('#000000'); // Set default text color to black
    const [textStyle, setTextStyle] = useState('Aboreto'); // New state for text style (font)
    const controlsRef = useRef(null);
    const [gifBoxes, setGifBoxes] = useState([]); // Store draggable GIFs
    const [selectedGifId, setSelectedGifId] = useState(null);
    const gifContainerRef = useRef(null);

    useEffect(() => {

        const defaultColor = defaultTextColors[selectedCard - 1];
        setTextColor(defaultColor);

        // Function to handle clicks outside the text box
        const handleClickOutside = (event) => {
            const cardPreview = document.querySelector('.card-preview-container');
            // Check if the click is outside both the text box and the controls section
            if (
                cardPreview && 
                !cardPreview.contains(event.target) && 
                controlsRef.current && 
                !controlsRef.current.contains(event.target)
            ) {
                setSelectedBoxId(null); // Deselect text box
            }
        };
    
        // Add event listener for clicks on the document
        document.addEventListener('mousedown', handleClickOutside);
    
        // Cleanup function to remove event listener when component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleHomeClick = () => {
        const confirmDiscard = window.confirm("Are you sure you want to discard your changes and go to the home page?");
        if (confirmDiscard) {
            navigate('/');
        }
    };


    const printRef = React.useRef();
    const handleSendClick = async () => {
        const confirmSend = window.confirm("Are you sure you would like to send this card?");

        if (confirmSend) {
            const element = printRef.current;
            const canvas = await html2canvas(element);
            console.log(selectedTAEmail);
        
            const data = canvas.toDataURL('image/jpg');
            axios({
                method: 'post',
                url: 'http://localhost:3001/card',
                data: {"data":data,"for": selectedTAEmail},
                config: { headers: {'Content-Type': 'multipart/form-data' }}
            })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });

        } 
        if (confirmSend) {
        const message = "You have been sent a card! http://localhost:3000/login"; // Assuming 'text' contains the card message
        const cardImage = cards[selectedCard - 1]; // Get the selected card image
    
        const templateParams = {
            to_email: selectedTAEmail, // Recipient email
            from_name: 'thankateacher', // Sender name (could be dynamic)
            message: message,
        };
    
            emailjs.send('service_zajqzw1', 'template_3annybp', templateParams, 'PCG3Qws_V456mFKTi')
                .then((response) => {
            console.log('Email successfully sent!', response.status, response.text);
            alert('Email sent successfully!');
        })
            .catch((error) => {
            console.error('Failed to send email:', error);
            alert('Failed to send email.');
        });
        
    }
        if (confirmSend) {
          // Navigate to the SentPage to show the animation
          navigate('/sent');
        }
    };

    
    // Reset when adding a new text box
    const handleAddTextBox = () => {
        if (text) {
    
            // Add the new text box with the current textColor (not resetting it)
            setTextBoxes([...textBoxes, {
                id: textBoxes.length + 1,
                content: text,
                color: textColor,  // Use the currently selected color (not the default one)
                textSize: previewTextSize,
                fontStyle: textStyle
            }]);
            setText('');  // Clear the text input
            setPreviewTextSize(20);  // Reset the text size for new box
            setTextStyle('Aboreto');  // Reset the font style for new box
        }
    };
    

    

    const handleDeleteTextBox = () => {
        if (selectedBoxId !== null) {
            // Filter out the selected text box
            setTextBoxes(prevBoxes => prevBoxes.filter(box => box.id !== selectedBoxId));
            setSelectedBoxId(null); // Deselect after deletion
        } else {
            alert("No text box is selected!");
        }
    };
    

    const handleTextClick = (id) => {
        setSelectedBoxId(id);
    
        // Fetch and apply text box properties to the controls
        const selectedBox = textBoxes.find(box => box.id === id);
        if (selectedBox) {
            setTextColor(selectedBox.color);
            setPreviewTextSize(selectedBox.textSize);
            setTextStyle(selectedBox.fontStyle); // Set the font style of the selected box
        }
    };

    const handleColorChange = (color) => {
        setTextColor(color);
        if (selectedBoxId !== null) {
            setTextBoxes(prevBoxes => 
                prevBoxes.map(box =>
                    box.id === selectedBoxId
                        ? { ...box, color: color }
                        : box
                )
            );
        }
    };

    const handleSizeChange = (e) => {
        const newSize = Math.max(e.target.value, 1); // Prevent size from going below 1
        setPreviewTextSize(newSize);
        if (selectedBoxId !== null) {
            setTextBoxes(prevBoxes => 
                prevBoxes.map(box =>
                    box.id === selectedBoxId
                        ? { ...box, textSize: newSize }
                        : box
                )
            );
        }
    };

    const handleFontStyleChange = (e) => {
        const newFontStyle = e.target.value;
        setTextStyle(newFontStyle);
        if (selectedBoxId !== null) {
            setTextBoxes(prevBoxes => 
                prevBoxes.map(box =>
                    box.id === selectedBoxId
                        ? { ...box, fontStyle: newFontStyle }
                        : box
                )
            );
        }
    };

    const handleExportCard = async () => {
        // Select the card preview container (the div that wraps the card and text)
        const cardPreview = document.querySelector('.card-preview-container');

        if (cardPreview) {
            // Capture the card preview as an image using html2canvas
            html2canvas(cardPreview, { useCORS: true }).then((canvas) => {
                // Convert the canvas to an image data URL
                const imgData = canvas.toDataURL('image/png');

                // Create a download link
                const link = document.createElement('a');
                link.href = imgData;
                link.download = 'card.png';  // Set the filename for download
                link.click();  // Trigger the download
            });
        }
    };

    const handleAddGif = (gifSrc) => {
        setGifBoxes([
            ...gifBoxes,
            {
                id: gifBoxes.length + 1,
                src: gifSrc,
            },
        ]);
    };

    const handleDeleteGif = () => {
        if (selectedGifId !== null) {
            setGifBoxes((prevGifBoxes) => 
                prevGifBoxes.filter((gif) => gif.id !== selectedGifId)
            );
            setSelectedGifId(null); // Deselect after deletion
        } else {
            alert("No GIF is selected!");
        }
    };

    const defaultTextColors = [
        '#FFFFFF',  
        '#FFFFFF', 
        '#FFFFFF',  
        '000000', 
        '#FFFFFF'   
    ];

    // Static Color Palette (Rainbow + Black, White, Brown)
    const colors = [
        '#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', 
        '#800080', '#FFC0CB', '#000000', '#FFFFFF', '#A52A2A'
    ];

    const cards = [
        emptyCard1,
        emptyCard2,
        emptyCard3,
        emptyCard4,
        emptyCard5
    ];

    return (
        <>
            <div className="blue-section">
                <p>3 of 3: Edit Card</p>
                <button onClick={handleHomeClick}>
                    <img src={homeIcon} alt="Home" />
                </button>
            </div>
            <div className="container">
                {/* Card Preview Section */}
                <div ref={printRef} className="card-preview-container">
                    <div id="preview" className="card-preview">
                        <img src={cards[selectedCard - 1]} alt="Selected card" />
                        { textBoxes.map((box) => (
                            <Draggable 
                                key={box.id} 
                                bounds="parent"
                                onStart={() => handleTextClick(box.id)}
                                onDrag={() => handleTextClick(box.id)}
                            >
                                <div
                                    className="draggable-text"
                                    style={{
                                        fontSize: `${box.textSize}px`,
                                        color: box.color,
                                        fontFamily: box.fontStyle, // Dynamically set font style
                                        border: selectedBoxId === box.id ? '2px solid blue' : 'none'
                                    }}
                                >
                                    {box.content}
                                </div>
                            </Draggable>

                        ))}
                        
                        {gifBoxes.map((gif) => (
                            <Draggable
                                key={gif.id}
                                bounds="parent"
                                onStart={() => setSelectedGifId(gif.id)} // Select the GIF on click/drag
                            >
                                <img
                                    src={gif.src}
                                    alt="Draggable GIF"
                                    className="draggable-gif"
                                    style={{
                                        border: selectedGifId === gif.id ? '2px solid red' : 'none', // Highlight selected GIF
                                    }}
                                />
                            </Draggable>
                        ))}
                        {text && (
                            <Draggable bounds="parent">
                                <div className="draggable-text" style={{ fontSize: `${previewTextSize}px`, color: textColor, fontFamily: textStyle }}>
                                    {text}
                                </div>
                            </Draggable>
                        )}
                    </div>
                </div>

                {/* GIF Selection Menu */}
                <div className="gif-selection-container">
                    <h3 className="gif-selection-title">GIF Selection</h3>
                    <div className="gif-placeholder">
                        <img
                            src={require('./Assets/Spongebob.gif')}
                            alt="Spongebob GIF"
                            className="gif-option"
                            onClick={() => handleAddGif(require('./Assets/Spongebob.gif'))}
                        />

                        <img
                            src={require('./Assets/TY1.gif')}
                            alt="Thank You GIF"
                            className="gif-option"
                            onClick={() => handleAddGif(require('./Assets/TY1.gif'))}
                        />

                        <img
                            src={require('./Assets/BearyBest.gif')}
                            alt="Beary Best GIF"
                            className="gif-option"
                            onClick={() => handleAddGif(require('./Assets/BearyBest.gif'))}
                        />

<img
                            src={require('./Assets/Heart.gif')}
                            alt="Heart GIF"
                            className="gif-option"
                            onClick={() => handleAddGif(require('./Assets/Heart.gif'))}
                        />
                    </div>
                </div>

                {/* Message Box Section */}
                <div className="message-box-container">
                    <label htmlFor="message">Add a Message</label>
                    <textarea id="message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your message here" />

                    {/* Text Style Dropdown */}
                    <select id="font-style" value={textStyle} onChange={handleFontStyleChange}>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Raleway">Raleway</option>
                        <option value="Oswald">Oswald</option>
                    </select>

                    {/* Text Size Slider */}
                    <label htmlFor="text-size">Text Size</label>
                    <div className="slider-container">
                        <input
                            id="text-size"
                            type="range"
                            min="10"
                            max="100"
                            value={previewTextSize}
                            onChange={handleSizeChange}
                        />
                        <span className="slider-value">{previewTextSize} pt</span>
                    </div>

                    {/* Text Color */}
                    <label htmlFor="color-picker">Text Color:</label>
                    <div className="color-palette">
                        {colors.map((color, index) => ( 
                            <div
                                key={index}
                                className="color-circle"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color)}
                            ></div>
                        ))}
                    </div>

                    {/* Buttons Section */}
                    <div className="controls">
                        <button onClick={() => navigate('/search')} className="back-button">&larr;</button>
                        <button onClick={handleSendClick} className="send-button">Send Card</button>
                        <button onClick={handleExportCard} className="export-button">Export Card</button> 
                    </div>

                    <button className="add-text-button" onClick={handleAddTextBox}>
                        Add Text to Card
                    </button>
                    


                    <button
                        className="delete-text-button"
                        onClick={handleDeleteTextBox}
                        disabled={!selectedBoxId} // Disable button if no box is selected
                        >
                        Delete Selected Text
                     </button>

                    <button
                        className="delete-gif-button"
                        onClick={handleDeleteGif}
                        disabled={!selectedGifId} // Disable if no GIF is selected
                        >
                        Delete Selected GIF
                    </button>
                </div>
            </div>
        </>
    );
}

export default BasePage;
