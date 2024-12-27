frontend / src / components / HomePage.js



import React, { useState } from 'react';

import axios from 'axios';

import { useNavigate } from 'react-router-dom';



const HomePage = () => {

    const [username, setUsername] = useState('');

    const [password, setPassword] = useState('');

    const [isParent, setIsParent] = useState(false);

    const [error, setError] = useState('');

    const navigate = useNavigate();



    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            const response = await axios.post('http://localhost:5000/api/auth/register', {

                username,

                password,

                isParent,

            });

            if (response.data.message) {

                alert('Registration successful! Please log in.');

                navigate('/auth');

            }

        } catch (err) {

            setError(err.response?.data?.error || 'Registration failed');

        }

    };



    return (

        <div className="home-page">

            <h1>Welcome to Chore Tracker</h1>

            <div className="registration-form">

                <h2>Register</h2>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleRegister}>

                    <input

                        type="text"

                        placeholder="Username"

                        value={username}

                        onChange={(e) => setUsername(e.target.value)}

                        required

                    />

                    <input

                        type="password"

                        placeholder="Password"

                        value={password}

                        onChange={(e) => setPassword(e.target.value)}

                        required

                    />

                    <label>

                        <input

                            type="checkbox"

                            checked={isParent}

                            onChange={(e) => setIsParent(e.target.checked)}

                        />

                        Register as a parent

                    </label>

                    <button type="submit">Register</button>

                </form>

                <p>

                    Already have an account? <a href="/auth">Log in here</a>.

                </p>

            </div>

        </div>

    );

};



export default HomePage;

