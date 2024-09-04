import { Routes, Route } from 'react-router-dom';
import Home from './homepage'
import TaSearch from './taSearch';
const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<TaSearch/>} />
            <Route path="/search" element={<Home/>} />
         </Routes>
      </>
   );
};
 
export default App;