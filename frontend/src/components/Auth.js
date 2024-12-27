import React, { useState } from 'react';

import axios from 'axios';

import { useNavigate } from 'react-router-dom';



const Auth = ({ setToken, setUserId }) => {

    const [username, setUsername] = useState('');

    const [password, setPassword] = useState('');

    const [isLogin, setIsLogin] = useState(true);

    const [error, setError] = useState('');

    const navigate = useNavigate();



    const handleSubmit = async (e) => {

        e.preventDefault();

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {

            const response = await axios.post(`http://localhost:5000${endpoint}`, { username, password });

            if (isLogin) {

                localStorage.setItem('token', response.data.token);

                localStorage.setItem('userId', response.data.userId);

                setToken(response.data.token);

                setUserId(response.data.userId);

                navigate('/');

            } else {

                alert('User registered successfully! Please log in.');

                setIsLogin(true);

            }

        } catch (err) {

            setError(err.response?.data?.error || 'Something went wrong');

        }

    };



    return (

        <div className="auth-container">

            <h2>{isLogin ? 'Login' : 'Register'}</h2>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>

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

                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>

            </form>

            <p>

                {isLogin ? "Don't have an account? " : "Already have an account? "}

                <button onClick={() => setIsLogin(!isLogin)}>

                    {isLogin ? 'Register' : 'Login'}

                </button>

            </p>

        </div>

    );

};



export default Auth;

