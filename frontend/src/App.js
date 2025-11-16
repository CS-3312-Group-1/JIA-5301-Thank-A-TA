import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/home'
import TaSearch from './components/pages/taSearch';
import Design from './components/pages/base';
import Sent from './components/pages/sent';
import TaInbox from './components/pages/taInbox';
import Login from './components/pages/login';
import Register from './components/pages/register';
import Admin from './components/pages/admin';
import AdminRoute from './components/common/AdminRoute';


export function getToken() {
   return sessionStorage.getItem('token');
}

export function getUserName() {
    return sessionStorage.getItem('name');
}

export function getUserRole() {
    return sessionStorage.getItem('isTa') === 'true';
}


const App = () => {
   return (
      <Routes>
         <Route path="/" element={<TaSearch />} />
         <Route path="/search" element={<Home />} />
         <Route path="/design" element={<Design />} />
         <Route path="/sent" element={<Sent />} />
         <Route path="/inbox" element={<TaInbox />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
         </Route>
      </Routes>
   );
};
 
export default App;