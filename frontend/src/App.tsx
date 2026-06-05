import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { AddMedicine } from "./pages/AddMedicine";
import { History } from "./pages/History";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-medicine" element={<AddMedicine />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
