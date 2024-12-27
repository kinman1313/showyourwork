import React, { useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './components/HomePage';

import Auth from './components/Auth';

import AdminPage from './components/AdminPage';

import RequestReset from './components/RequestReset';

import ResetPassword from './components/ResetPassword';

import './App.css';



function App() {

    const [token, setToken] = useState(localStorage.getItem('token'));

    const [userId, setUserId] = useState(localStorage.getItem('userId'));



    return (

        <Router>

            <div className="App">

                <Routes>

                    <Route path="/" element={<HomePage />} />

                    <Route path="/auth" element={<Auth setToken={setToken} setUserId={setUserId} />} />

                    <Route path="/admin" element={<AdminPage />} />

                    <Route path="/request-reset" element={<RequestReset />} />

                    <Route path="/reset-password" element={<ResetPassword />} />

                </Routes>

            </div>

        </Router>

    );

}



export default App;
