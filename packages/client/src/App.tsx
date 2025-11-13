import { Route, Routes } from "react-router-dom";
import Register from "./pages/Auth/Register";

function App() {

  return (
    <Routes>
      <Route path="/" element={<div>test</div>} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
