import { Route, Routes } from "react-router-dom";
import Register from "./pages/Auth/Register";
import { useUser } from "./utils/api/users";
import Login from "./pages/Auth/Login";

function App() {
  useUser()
  return (
    <Routes>
      <Route path="/" element={<div>test</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
