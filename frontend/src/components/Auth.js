import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';

const Auth = ({ setToken, setUserId }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const authFunction = isLogin ? login : register;
            const { token, userId } = await authFunction({ username, password });

            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            setToken(token);
            setUserId(userId);
            navigate('/');
        } catch (err) {
            setError(err.error || 'An error occurred');
        }
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            {error && <div className="error">{error}</div>}
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
                <button type="submit">
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>
            <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                    className="link-button"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Register' : 'Login'}
                </button>
            </p>
        </div>
    );
};

export default Auth;

