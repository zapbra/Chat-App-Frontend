import "./App.css";
import Chatroom from "./components/chatroom/Chatroom";
import { BrowserRouter, Routes, Route } from "react-router";
import Chatrooms from "./pages/Chatrooms";
import Layout from "./components/Layout";
import { AuthProvider } from "./components/context/AuthProvider";
import SignUp from "./pages/Signup";
import SignIn from "./pages/SignIn";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        {/** Main Chat Room Page */}
                        <Route path="/" element={<Chatrooms />} />
                        {/* Specific Chat Room Page by id*/}
                        <Route path="chatroom/:roomId" element={<Chatroom />} />

                        <Route path="sign-up" element={<SignUp />} />

                        <Route path="sign-in" element={<SignIn />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
