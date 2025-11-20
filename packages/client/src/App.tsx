import { Route, Routes } from "react-router-dom";
import Register from "./pages/Auth/Register";
import { useUser } from "./utils/api/users";
import Login from "./pages/Auth/Login";
import Main from "./pages/Main/Main";
import Community from "./pages/Community/Main";
import Submit from "./pages/Community/Submit";
import Comment from "./pages/Community/Comment";
import User from "./pages/User/Main";

function App() {
  useUser()
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/c/:name" element={<Community />} />
      <Route path="/c/:name/submit" element={<Submit />} />
      <Route path="/c/:name/comments/:commentId" element={<Comment />} />
      <Route path="/u/:name" element={<User />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
