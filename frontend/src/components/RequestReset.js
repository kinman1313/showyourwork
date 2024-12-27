import React, { useState } from 'react';

import axios from 'axios';

import { useNavigate } from 'react-router-dom';



const RequestReset = () => {

    const [email, setEmail] = useState('');

    const [message, setMessage] = useState('');

    const navigate = useNavigate();



    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await axios.post('http://localhost:5000/api/auth/request-reset', { email });

            setMessage('Reset email sent. Check your inbox.');

        } catch (err) {

            setMessage(err.response?.data?.error || 'Something went wrong');

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
