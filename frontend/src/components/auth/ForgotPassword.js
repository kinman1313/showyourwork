import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('Check your inbox for password reset instructions');
        } catch (err) {
            setError('Failed to reset password');
            console.error('Reset password error:', err);
        }
        setLoading(false);
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Reset Password</h2>
                <p className="subtitle">Enter your email to reset your password</p>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            autoComplete="email"
                            name="email"
                        />
                    </div>
                    <button
                        type="submit"
                        className="reset-button"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>

                <div className="links">
                    <Link to="/login" className="back-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 