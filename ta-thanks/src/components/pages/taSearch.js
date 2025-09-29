/* eslint-disable no-unused-vars */
import '../../styles/taSearch.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getToken } from '../../App';
import Navbar from '../common/Navbar';

function TaSearch() {
  const navigate = useNavigate();
  const [classCS, setClass] = useState([]);
  const [classTA, setTA] = useState([]);
  const [email, setEmail] = useState([]);
  const [data, setData] = useState(null);
  const [selectedTAEmail, setSelectedTAEmail] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTA, setSelectedTA] = useState('0');

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
    }
  }, [navigate]);

  /* fetch data from database */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/', { mode: 'cors' });
        const jsonData = await response.json();

        if (jsonData && jsonData["0"] && jsonData["0"].data) {
          const classesData = jsonData["0"].data;
          const allClasses = [...new Set(Object.values(classesData).map(r => r.class))].map((name, i) => ({ id: String(i), name }));
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
    if (data) {
      const selectedClass = classCS.find(c => c.id === id);
      if (selectedClass) {
        setSelectedClass(selectedClass.name);
        const selectedTAs = data["0"].data.filter(o => o.class === selectedClass.name).map(({ name, email }) => ({ id: name, name, email }));

        setTA(selectedTAs); 
        const emails = selectedTAs.map(ta => ta.email);
        setEmail(emails);
        setSelectedTAEmail('');
        setSelectedTA('0');
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
    setSelectedTA(id);
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
      <Navbar title="1 of 3: Select TA" />
      <h1 className="main-title">Thank-a-Teacher</h1>

      <div className='select-wrapper textPadding'>
        <select id="ddlClasses" className='form-control' onChange={(e) => handleClass(e.target.value)}>
          <option value="0" disabled selected>Select Class</option>
          {classCS && classCS !== undefined ? classCS.map((ctr, index) => {
            return <option key={index} value={ctr.id}>{ctr.name}</option>
          }) : "No Class"}
        </select>
      </div>

      <div className='select-wrapper textPadding'>
        <select id="ddlTAs" className='form-control' value={selectedTA} onChange={(e) => handleTASelction(e.target.value)} disabled={classTA.length === 0}>
          <option value="0" disabled selected>Select TA</option>
          {classTA && classTA !== undefined ? classTA.map((ctr, index) => {
            return <option key={index} value={ctr.id}>{ctr.name}</option>
          }) : "No TA"}
        </select>
      </div>

       <div className='textPadding'>
      <button onClick={() => navigate('search', { state: { email: selectedTAEmail, selectedClass: selectedClass } })} className='nextButton'>
  Next
</button>

      </div>

      <div className='textPadding'>
        <h3>Selected TA Email:</h3>
        {selectedTAEmail ? <div>{selectedTAEmail}</div> : <div>No email selected</div>}
      </div>
    </div>
  );
}

export default TaSearch;
