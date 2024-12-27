import React, { useState } from 'react';

import axios from 'axios';

import { useNavigate } from 'react-router-dom';



const RequestReset = () => {

    const [email, setEmail] = useState('');

    const [message, setMessage] = useState('');

    const [error, setError] = useState('');

    const navigate = useNavigate();



    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/request-reset`, { email });

            setMessage(response.data.message);

            setTimeout(() => navigate('/auth'), 3000);

        } catch (err) {

            setError(err.response?.data?.error || 'Failed to send reset email');

        }

    };



    return (

        <div className="auth-container">

            <h2>Reset Password</h2>

            <form onSubmit={handleSubmit}>

                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}

                    required

                />

                <button type="submit">Send Reset Link</button>

            </form>

            {message && <p>{message}</p>}

            <p>

                Remember your password? <a href="/auth">Log in here</a>.

            </p>

        </div>

    );

};



export default RequestReset;
