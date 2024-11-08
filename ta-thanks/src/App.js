import { Routes, Route } from 'react-router-dom';
import Home from './homepage'
import TaSearch from './taSearch';
import Design from './basepage';
import SentPage from './SentPage';
import TaInbox from './taInbox';
const App = () => {
   return (
      <>
         <Routes>
            <Route path="/" element={<TaSearch/>} />
            <Route path="/search" element={<Home/>} />
            <Route path="/design" element={<Design/>} />
            <Route path="/sent" element={<SentPage />} />
            <Route path ="/inbox" element={<TaInbox />} />
         </Routes>
      </>
   );
};
 
export default App;