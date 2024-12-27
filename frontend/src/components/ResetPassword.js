import React, { useState } from 'react';

import axios from 'axios';

import { useNavigate, useLocation } from 'react-router-dom';



const ResetPassword = () => {

    const [newPassword, setNewPassword] = useState('');

    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const location = useLocation();

    const token = new URLSearchParams(location.search).get('token');



    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await axios.post('http://localhost:5000/api/auth/reset-password', { token, newPassword });

            setMessage('Password reset successfully. You can now log in.');

            navigate('/auth');

        } catch (err) {

            setMessage(err.response?.data?.error || 'Something went wrong');

        }

    };



    return (

        <div className="auth-container">

            <h2>Reset Password</h2>

            <form onSubmit={handleSubmit}>

                <input

                    type="password"

                    placeholder="New Password"

                    value={newPassword}

                    onChange={(e) => setNewPassword(e.target.value)}

                    required

                />

                <button type="submit">Reset Password</button>

            </form>

            {message && <p>{message}</p>}

        </div>

    );

};



export default ResetPassword;
