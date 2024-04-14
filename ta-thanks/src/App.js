import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [classCS, setClass] = useState([]);
  const [classTA, setTA] = useState([]);
  const [email, setEmail] = useState([]);
  const [data, setData] = useState(null);
  const [selectedTAEmail, setSelectedTAEmail] = useState('');

  /* fetch data from database */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/', { mode: 'cors' });
        const jsonData = await response.json();

        if (jsonData && jsonData["0"] && jsonData["0"].data) {
          const classesData = jsonData["0"].data;
          const allClasses = Object.keys(classesData).map((className, index) => {
            return { id: `${index + 1}`, name: className };
          });

          setClass(allClasses); // set class data from JSON
          setData(jsonData); // set Data var to be parsed from later
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  /* Only populate select TA from current TAs in class */
  const handleClass = (id) => {
    if (id !== "0" && data) {
      const selectedClass = classCS.find(c => c.id === id);
      if (selectedClass) {
        const selectedTAs = Object.entries(data["0"].data[selectedClass.name]).map(([name, email]) => {
          return { id: name, name, email };
        });

        setTA(selectedTAs);
        const emails = selectedTAs.map(ta => ta.email);
        setEmail(emails);
        setSelectedTAEmail('');
      } else {
        setTA([]);
        setEmail([]);
        setSelectedTAEmail('');
      }
    } else {
      setTA([]);
      setEmail([]);
      setSelectedTAEmail('');
    }
  }

  /* Set email var of selected TA */
  const handleTASelction = (id) => {
    if (id !== "0") {
      const selectedTA = classTA.find(ta => ta.id === id);
      if (selectedTA) {
        setSelectedTAEmail(selectedTA.email);
      } else {
        setSelectedTAEmail('');
      }
    } else {
      setSelectedTAEmail('');
    }
  }

  return (
    <div className="App">
      <div className="header">
        <div className="title">1 of 3: Select TA</div>
      </div>
      <h1 className="main-title">Thank-a-Teacher</h1>

      <div className='select-wrapper textPadding'>
        <select id="ddlClasses" className='form-control' onChange={(e) => handleClass(e.target.value)}>
          <option value="0">Select Class</option>
          {classCS && classCS !== undefined ? classCS.map((ctr, index) => {
            return <option key={index} value={ctr.id}>{ctr.name}</option>
          }) : "No Class"}
        </select>
      </div>

      <div className='select-wrapper textPadding'>
        <select id="ddlTAs" className='form-control' onChange={(e) => handleTASelction(e.target.value)}>
          <option value="0">Select TA</option>
          {classTA && classTA !== undefined ? classTA.map((ctr, index) => {
            return <option key={index} value={ctr.id}>{ctr.name}</option>
          }) : "No TA"}
        </select>
      </div>

      <div className='textBox'>
        <input className="form-control" type="text" placeholder="Your Email" />
      </div>

      <div className='textPadding'>
        <button className='nextButton'>Next</button>
      </div>

      <div className='textPadding'>
        <h3>Selected TA Email:</h3>
        {selectedTAEmail ? <div>{selectedTAEmail}</div> : <div>No email selected</div>}
      </div>
    </div>
  );
}

export default App;
