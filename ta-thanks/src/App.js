import { Routes, Route } from 'react-router-dom';
import Home from './homepage'
import TaSearch from './taSearch';
import Design from './basepage';
import SentPage from './SentPage';
import TaInbox from './taInbox';
import Login from './loginpage';


function setToken(userToken) {
   sessionStorage.setItem('token', JSON.stringify(userToken));
}

function getToken() {
   const tokenString = sessionStorage.getItem('token');
   const userToken = JSON.parse(tokenString);
   return userToken?.token
}


const App = () => {
   const token = getToken();

 
   return (
      <>
         <Routes>
            <Route path="/" element={<TaSearch/>} />
            <Route path="/search" element={<Home/>} />
            <Route path="/design" element={<Design/>} />
            <Route path="/sent" element={<SentPage />} />
            <Route path ="/inbox" element={<TaInbox />} />
            <Route path="/login" element={<Login/>} />
         </Routes>
      </>
   );
};
 
export default App;