/* eslint-disable no-unused-vars */
import '../../styles/taSearch.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { getToken } from '../../App';
import Navbar from '../common/Navbar';

function TaSearch() {
  const navigate = useNavigate();

  // Data states
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tas, setTAs] = useState([]);

  // Selection states
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTA, setSelectedTA] = useState('');
  
  // Derived state for the next page
  const [selectedTAEmail, setSelectedTAEmail] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/semesters/enabled');
        setSemesters(response.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchSemesters();
  }, []);

  const handleSemesterChange = async (e) => {
    const semesterId = e.target.value;
    setSelectedSemester(semesterId);

    // Reset subsequent selections
    setClasses([]);
    setTAs([]);
    setSelectedClass('');
    setSelectedTA('');
    setSelectedTAEmail('');
    setSelectedClassName('');

    if (semesterId) {
      try {
        const response = await axios.get(`http://127.0.0.1:3001/tas/${semesterId}`);
        const taData = response.data;
        const uniqueClasses = [...new Set(taData.map(item => item.class))];
        setClasses(uniqueClasses.map((name, i) => ({ id: String(i), name })));
      } catch (error) {
        console.error('Error fetching TAs for semester:', error);
      }
    }
  };

  const handleClassChange = async (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    
    // Reset TA selection
    setTAs([]);
    setSelectedTA('');
    setSelectedTAEmail('');

    if (className && selectedSemester) {
        try {
          const response = await axios.get(`http://127.0.0.1:3001/tas/${selectedSemester}`);
          const taData = response.data.filter(item => item.class === className);
          setTAs(taData.map(ta => ({ id: ta.email, name: ta.name, email: ta.email })));
          const selectedClassObj = classes.find(c => c.name === className);
          if(selectedClassObj) {
              setSelectedClassName(selectedClassObj.name);
          }
        } catch (error) {
          console.error('Error fetching TAs for class:', error);
        }
    }
  };

  const handleTAChange = (e) => {
    const taEmail = e.target.value;
    setSelectedTA(taEmail);
    const selectedTAObject = tas.find(ta => ta.email === taEmail);
    if(selectedTAObject) {
        setSelectedTAEmail(selectedTAObject.email);
    }
  };

  return (
    <div className="App">
      <Navbar title="1 of 3: Select TA" />
      <h1 className="main-title">Thank-a-Teacher</h1>

      <div className='select-wrapper textPadding'>
        <select className='form-control' value={selectedSemester} onChange={handleSemesterChange}>
          <option value="" disabled>Select Semester</option>
          {semesters.map((semester) => (
            <option key={semester._id} value={semester.semester}>{semester.semester}</option>
          ))}
        </select>
      </div>

      <div className='select-wrapper textPadding'>
        <select className='form-control' value={selectedClass} onChange={handleClassChange} disabled={!selectedSemester}>
          <option value="" disabled>Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className='select-wrapper textPadding'>
        <select className='form-control' value={selectedTA} onChange={handleTAChange} disabled={!selectedClass}>
          <option value="" disabled>Select TA</option>
          {tas.map((ta) => (
            <option key={ta.id} value={ta.email}>{ta.name}</option>
          ))}
        </select>
      </div>

      <div className='textPadding'>
        <button 
          onClick={() => navigate('search', { state: { email: selectedTAEmail, selectedClass: selectedClassName } })} 
          className='nextButton' 
          disabled={!selectedTA}
        >
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
