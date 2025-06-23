import "./App.css";
import Chatroom from "./components/chatroom/Chatroom";
import { BrowserRouter, Routes, Route } from "react-router";
import Chatrooms from "./pages/Chatrooms";
import Layout from "./components/Layout";
import { AuthProvider } from "./components/context/AuthProvider";
import SignUp from "./pages/Signup";
import SignIn from "./pages/SignIn";
import Account from "./pages/Account";
import ProfileLayout from "./components/profile/ProfileLayout";
import DirectMessages from "./pages/profile/DirectMessages";
import UserPage from "./pages/user/UserPage";
import Following from "./pages/profile/Following";

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

                        <Route path="account" element={<Account />} />

                        <Route path="/profile" element={<ProfileLayout />}>
                            <Route
                                path="messages"
                                element={<DirectMessages />}
                            />
                            <Route
                                path="messages/:userId"
                                element={<DirectMessages />}
                            />
                            <Route path="following" element={<Following />} />
                        </Route>

                        <Route path="/user/:userId" element={<UserPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
