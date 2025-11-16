import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from 'html2canvas';
import Draggable from 'react-draggable'; 
import "../../styles/base.css";
import emptyCard1 from '../../assets/card1_Empty.png';
import emptyCard2 from '../../assets/card2_Empty.png';
import emptyCard3 from '../../assets/Card3_Empty.png';
import emptyCard4 from '../../assets/card4_Empty.png';
import emptyCard5 from '../../assets/card5_Empty.png';
import axios from "axios";
import GIF from '../../utils/GIF';
import GIFEncoder from '../../utils/GIFEncoder';
import { encode64 } from '../../utils/b64';
import { getUserName } from '../../App';
import ConfirmationModal from '../common/ConfirmationModal';
import Navbar from '../common/Navbar';
import { API_BASE_URL, FRONTEND_BASE_URL } from '../../apiConfig';

function BasePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedCard, selectedTAEmail, selectedClass } = location.state || {};  // Retrieve card data from the router state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [onConfirmAction, setOnConfirmAction] = useState(null);
    const [text, setText] = useState(''); // State to store the user's message
    const [textBoxes, setTextBoxes] = useState([]); // Store multiple draggable text boxes
    const [selectedBoxId, setSelectedBoxId] = useState(null); // Track the currently selected text box
    const [previewTextSize, setPreviewTextSize] = useState(20); // Manage preview text size for new text boxes
    const [textColor, setTextColor] = useState('#000000'); // Set default text color to black
    const [textStyle, setTextStyle] = useState('Aboreto'); // New state for text style (font)
    const controlsRef = useRef(null);
    const [gifBoxes, setGifBoxes] = useState([]); // Store draggable GIFs
    const [gifPosition, setGifPosition] = useState([]);
    const [gifPositionID, setGifPositionID] = useState([])
    const [selectedGifId, setSelectedGifId] = useState(null);
    const gifContainerRef = useRef(null);
    const [availableGifs, setAvailableGifs] = useState([]);
    const defaultTextColors = [
        '#FFFFFF',  
        '#FFFFFF', 
        '#FFFFFF',  
        '000000', 
        '#FFFFFF'   
    ];
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
    }, [selectedCard, defaultTextColors]);

    const [gifs, setGifs] = useState([]);
    const arrayBufferToDataUrl = (arrayBuffer, contentType) => {
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }
        const base64 = window.btoa(binary);
        return `data:${contentType};base64,${base64}`;
    };

    const fetchGifs = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/get-gifs`);
            const gifSummaries = response.data || [];

            const gifsWithDataUrls = await Promise.all(
                gifSummaries.map(async (gif) => {
                    const gifResponse = await axios.get(
                        `${API_BASE_URL}/get-gif/${gif._id}`,
                        { responseType: 'arraybuffer' }
                    );
                    const contentType = gifResponse.headers['content-type'] || 'image/gif';
                    const dataUrl = arrayBufferToDataUrl(gifResponse.data, contentType);
                    return { ...gif, dataUrl };
                })
            );

            setGifs(gifsWithDataUrls);
        } catch (error) {
            console.error('Error fetching GIFs:', error);
        }
    }, []);

    useEffect(() => {
        fetchGifs();
    }, [fetchGifs]);

    const handleHomeClick = () => {
        setModalMessage("Are you sure you want to discard your changes and go to the home page?");
        setOnConfirmAction(() => () => navigate('/'));
        setIsModalOpen(true);
    };
    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    var loadedGIF = []
    var waitingOnGIF = gifPositionID.length;

    const loadGIF = async (src, callback) => {
        const myGif = GIF();
        myGif.onerror = function(e) {
            console.log("Gif loading error " + e.type);
        };
    
        myGif.load(src);
        myGif.onload = function() {
            console.log("LOADED GIF", src);
            loadedGIF.push(myGif);
            callback(); // Notify that the GIF has loaded
        };
    };
    
    const loadGIFs = async() => {
        for (let index = 0; index < gifPositionID.length; index++) {
            const gifID = gifPositionID[index];
            const position = gifPosition[index];
            const x = position[0];
            const y = position[1];
            const src = gifBoxes[index].src;

            // Process GIF loading with timeout to allow UI updates
            await new Promise((resolve) => {
                setTimeout(() => {
                    loadGIF(src, resolve); // Load the GIF and resolve once it's loaded
                }, 0); // 0 ms delay to yield control to the UI thread
            });
        }

        console.log("All GIFs loaded");
    };

    const printRef = React.useRef();
    const handleSendClick = () => {
        setModalMessage("Are you sure you would like to send this card?");
        setOnConfirmAction(() => async () => {
            try {
                const element = printRef.current;
                const canvas = await html2canvas(element, {
                    useCORS: true,
                    logging: true,
                });

                const adjustedPositions = await Promise.all(gifPosition.map(async ([x, y], index) => {
                    const imgElement = document.getElementById(gifPositionID[index]);
                    if (imgElement) {
                        const rect = imgElement.getBoundingClientRect();
                        const containerRect = element.getBoundingClientRect();
                        const imgX = rect.left;
                        const imgY = rect.top + window.scrollY - ((containerRect.y / 3 ) - 10);
                        return [imgX, imgY];
                    }
                    return [x, y];
                }));

                const ctx = canvas.getContext("2d");
                const encoder = new GIFEncoder();
                encoder.setRepeat(0);
                encoder.setDelay(500);
                encoder.start();

                await loadGIFs();

                for (let frame = 0; frame < 20; frame++) {
                    for (let index = 0; index < loadedGIF.length; index++) {
                        const gif = loadedGIF[index];
                        const position = adjustedPositions[index];
                        const x = position[0];
                        const y = position[1] + 25;

                        if (gif.frames && gif.frames[frame] && gif.frames[frame].image) {
                            const gifFrame = gif.frames[frame];
                            const image = gifFrame.image;
                            ctx.drawImage(image, x, y, 150, 150);
                        } else {
                            console.warn(`Frame ${frame} does not exist for GIF at index ${index}.`);
                        }
                    }
                    encoder.addFrame(ctx);
                }

                encoder.finish();
                const binaryGif = encoder.stream().getData();
                const data = "data:image/gif;base64," + encode64(binaryGif);

                await axios({
                    method: "post",
                    url: `${API_BASE_URL}/card`,
                    data: {
                        data: data,
                        forEmail: selectedTAEmail,
                        fromName: getUserName(),
                        fromClass: selectedClass
                    },
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                });

                navigate('/sent');

            } catch (error) {
                console.error("Error in sending card process:", error);
                alert('Failed to send card.');
            }
        });
        setIsModalOpen(true);
    };

    const handleConfirm = async () => {
        setIsModalOpen(false);
        if (onConfirmAction) {
            await onConfirmAction();
        }
        setOnConfirmAction(null);
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
        if (selectedBoxId !== id) {
            setSelectedBoxId(id); // Set selected only when it's not already selected
        } else {
            setSelectedBoxId(null); // Deselect if already selected
        }
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
    const handleAddGif = (gif) => {
        if (!gif?.dataUrl) {
            return;
        }
        setGifBoxes((prevGifBoxes) => [
            ...prevGifBoxes,
            {
                id: "GIF" + (prevGifBoxes.length + 1),
                src: gif.dataUrl,
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
    const handleStop = (event, dragElement) => {
        var id = event.target.id;
        if (id === '') {
            return
        }
        console.log(id)
        console.log(gifPositionID)
        for(var v of gifPositionID.entries()) {
            if(v[1] === id) {
                gifPosition[v[0]] = [dragElement.x,  dragElement.y]
                setGifPosition(gifPosition) 
                console.log(gifPosition) 
                return;
            }
        }
        setGifPositionID([...gifPositionID, id])
        setGifPosition([...gifPosition, [dragElement.x,  dragElement.y]])
        console.log(gifPosition)
        console.log(gifBoxes)
      };

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
            <Navbar title="3 of 3: Edit Card" />
            <ConfirmationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={handleConfirm} 
                message={modalMessage} 
            />
            <div className="design-layout">
                <div className="message-box-container">
                    <label htmlFor="message">Add a Message</label>
                    <textarea
                        id="message"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter your message here"
                    />

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
                </div>

                {/* Card Preview Section */}
                <div ref={printRef} className="card-preview-container">
                    <div id="preview" className="card-preview">
                        <img src={cards[selectedCard - 1]} alt="Selected card" />
                        {textBoxes.map((box) => (
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
                                        fontFamily: box.fontStyle,
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
                                onStop={handleStop}
                                bounds="parent"
                                onStart={() => setSelectedGifId(gif.id)} // Select the GIF on click/drag
                            >
                                <img
                                    id={gif.id}
                                    src={gif.src}
                                    alt="Draggable GIF"
                                    className="draggable-gif"
                                />
                            </Draggable>
                        ))}

                        {text && (
                            <Draggable bounds="parent">
                                <div
                                    className="draggable-text"
                                    style={{
                                        fontSize: `${previewTextSize}px`,
                                        color: textColor,
                                        fontFamily: textStyle
                                    }}
                                >
                                    {text}
                                </div>
                            </Draggable>
                        )}
                    </div>
                </div>

                <div className="right-panel">
                    {/* GIF Selection Menu */}
                    <div className="gif-selection-container">
                        <h3 className="gif-selection-title">GIF Selection</h3>
                        <div className="gif-placeholder">
                            {/* Dynamically loaded GIFs from database */}
                            {gifs.map((gif) => (
                                <img
                                    key={gif._id} // Use _id from the database
                                    src={gif.dataUrl}
                                    alt={gif.name} // Optional alt text for accessibility
                                    className="gif-option"
                                    onClick={() =>
                                        handleAddGif(gif)
                                    } // Pass URL to handler
                                />
                            ))}
                        </div>
                    </div>

                    {/* Buttons Section */}
                    <div className="action-panel">
                        <div className="controls">
                            <button onClick={() => navigate('/search')} className="back-button">
                                &larr;
                            </button>
                            <button onClick={handleSendClick} className="send-button">
                                Send Card
                            </button>
                            <button onClick={handleExportCard} className="export-button">
                                Export Card
                            </button>
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
            </div>
        </>
    );
}

export default BasePage;
