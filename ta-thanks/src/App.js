import { Routes, Route } from 'react-router-dom';
import Home from './homepage'
import TaSearch from './taSearch';
import Design from './basepage';
const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<TaSearch/>} />
            <Route path="/search" element={<Home/>} />
            <Route path="/design" element={<Design/>} />
         </Routes>
      </>
   );
};
 
export default App;