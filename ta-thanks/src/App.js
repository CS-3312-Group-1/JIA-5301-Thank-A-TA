import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

function App() {

  const [classCS, setClass] = useState([]);
  const [classTA, setTA] = useState([]);
  const [email, setEmail] = useState([]);
  const [data, setData] = useState(null); // State to hold the JSON data
  const [selectedTAEmail, setSelectedTAEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/', { mode: 'cors' });
        const jsonData = await response.json();
        console.log({ jsonData });

        if (jsonData && jsonData["0"] && jsonData["0"].data) {
          const classesData = jsonData["0"].data;
          const allClasses = Object.keys(classesData).map((className, index) => {
            return { id: `${index + 1}`, name: className };
          });

          setClass(allClasses);
          setData(jsonData); // Save JSON data to state
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

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
      <div style={{width: '100%', height: '100%', paddingTop: 12, paddingBottom: 13, paddingLeft: 111, paddingRight: 671, background: '#003057', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
        <div style={{width: 741, height: 34, color: 'white', fontSize: 32, fontFamily: 'Helvetica', fontWeight: '400', wordWrap: 'break-word'}}>1 of 3: Select TA</div>
      </div>
      <div style={{color: '#333333', fontSize: 64, fontFamily: 'Helvetica', fontWeight: '400', wordWrap: 'break-word', marginTop: '20px'}}>Thank-a-Teacher</div>

      <select id="ddlClasses" className='form-control select-class' onChange={(e) => handleClass(e.target.value)} style={{ marginBottom: '20px', marginTop: '90px' }}>
        <option value="0"> Select Class </option>
        {
          classCS && classCS !== undefined ?
            classCS.map((ctr, index) => {
              return <option key={index} value={ctr.id}>{ctr.name}</option>
            }) : "No Class"
        }
      </select>
      <br></br>
      <select id="ddlTAs" className='form-control select-class' onChange={(e) => handleTASelction(e.target.value)}>
        <option value="0"> Select TA </option>
        {
          classTA && classTA !== undefined ?
            classTA.map((ctr, index) => {
              return <option key={index} value={ctr.id}>{ctr.name}</option>
            }) : "No TA"
        }
      </select>
      <br></br>
      <div>
        <h3>Email:</h3>
        {
          selectedTAEmail ? <div>{selectedTAEmail}</div> : <div>No email selected</div>
        }
      </div>
    </div>
  );
}

export default App;
