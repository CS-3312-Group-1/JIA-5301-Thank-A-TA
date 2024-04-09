import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

function App() {

  const classes = [
    {id: "1", name: "CS1331"},
    {id: "2", name: "CS1332"}
  ];

  const TAs = [
    {id: "1", classId: "1", name: "John Smith"},
    {id: "2", classId: "1", name: "Callie Rigsbee"},
    {id: "3", classId: "2", name: "Mckinley Milner"},
    {id: "4", classId: "2", name: "kermit Frog"}
  ];

  const [classCS, setClass] = useState([]);
  const [classTA, setTA] = useState([]);

  useEffect(() => {
    setClass(classes);
  }, [])

  const handleClass = (id) => {
      const dt = TAs.filter(x => x.classId === id);
      setTA(dt);
  }

  return (
    <div className="App">
      <div style={{width: '100%', height: '100%', paddingTop: 12, paddingBottom: 13, paddingLeft: 111, paddingRight: 671, background: '#003057', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
      <div style={{width: 741, height: 34, color: 'white', fontSize: 32, fontFamily: 'Helvetica', fontWeight: '400', wordWrap: 'break-word'}}>1 of 3: Select TA</div>
      </div>
      <div style={{color: '#333333', fontSize: 64, fontFamily: 'Helvetica', fontWeight: '400', wordWrap: 'break-word', marginTop: '20px'}}>Thank-a-Teacher</div>

      <select id = "ddlClasses" className='form-control select-class' onChange = {(e) => handleClass(e.target.value)} style={{ marginBottom: '20px', marginTop: '90px' }}>
        <option value = "0"> Select Class </option>
      {
        classCS && 
        classCS !== undefined ?
        classCS.map((ctr, index) => {
          return <option key = {index} value = {ctr.id}>{ctr.name}</option>
        })
        :"No Class"
      }
      </select>
      <br></br>
      <select id = "ddlTAs" className='form-control select-class'>
        <option value = "0"> Select TA </option>
      {
        classTA && 
        classTA !== undefined ?
        classTA.map((ctr, index) => {
          return <option key = {index} value = {ctr.id}>{ctr.name}</option>
        })
        :"No TA"
      }
      </select>
    </div>
  );
}

export default App;
