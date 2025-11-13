import { Route, Routes } from "react-router-dom";
import Register from "./pages/Auth/Register";
import { useUser } from "./utils/api/users";
import Login from "./pages/Auth/Login";
import Main from "./pages/Main/Main";
import Community from "./pages/Community/Main";

function App() {
  useUser()
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/c/:name" element={<Community />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
