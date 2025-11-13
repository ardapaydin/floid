import { Route, Routes } from "react-router-dom";
import Register from "./pages/Auth/Register";
import { useUser } from "./utils/api/users";
import Login from "./pages/Auth/Login";
import Main from "./pages/Main/Main";

function App() {
  useUser()
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
