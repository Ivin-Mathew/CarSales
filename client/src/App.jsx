import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserHome from "./user/userHome";
import SearchResults from "./user/searchResults";
import SignIn from "./user/signUp";
import WishList from "./user/wishList";
import CarDetails from "./user/car-details"; 
import CompareCars from './user/CompareCars';
import MakeAnOffer from './user/MakeAnOffer';
import Profile from "./user/userProfile";
import DealershipSignIn from "./dealership/dealerLogin";
import DealerRoutes from "./dealership/DealerRoutes";

function App() {
  return (
    <Router>
      <Routes>
        {/* For normal user */}
        <Route path="/" element={<UserHome />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/carDetails/" element={<CarDetails />} /> 
        <Route path="/wishlist" element={<WishList />} />
        <Route path="/compareCars" element={<CompareCars />} />
        <Route path="/makeAnOffer" element={<MakeAnOffer />} />
        <Route path="/profile" element={<Profile />} />

        {/* For dealership */}
        <Route path="/dealershipLogin" element={<DealershipSignIn />} />
        <Route path="/dealership/*" element={<DealerRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;