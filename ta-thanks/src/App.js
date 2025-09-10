import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/home'
import TaSearch from './components/pages/taSearch';
import Design from './components/pages/base';
import Sent from './components/pages/sent';
import TaInbox from './components/pages/taInbox';
import Login from './components/pages/login';
import Register from './components/pages/register';
import Admin from './components/pages/admin';
import { UserProvider } from './context/UserContext';


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

  // if(!token) {
      // Figure out later
     // return <Login setToken={setToken} />
  // }
   return (
      <UserProvider> {/* Wrap everything in UserProvider */}
         <Routes>
            <Route path="/" element={<TaSearch />} />
            <Route path="/search" element={<Home />} />
            <Route path="/design" element={<Design />} />
            <Route path="/sent" element={<Sent />} />
            <Route path="/inbox" element={<TaInbox />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register setToken={setToken} />} />
            <Route path="/admin" element={<Admin />} />
         </Routes>
      </UserProvider>
   );
};
 
export default App;