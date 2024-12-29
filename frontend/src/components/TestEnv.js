import React, { useState, useEffect } from 'react';
import api from '../api';

const TestEnv = () => {
    const [apiTest, setApiTest] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log('Testing connection to:', process.env.REACT_APP_API_URL);
                const response = await api.get('/test-env');
                console.log('Response data:', response.data);
                setApiTest(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error('Full error:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        testConnection();
    }, []);

    return (
        <div className="admin-section">
            <h3>Environment Test</h3>
            <p>Frontend API URL: {process.env.REACT_APP_API_URL}</p>

            <h3>Backend Connection Test:</h3>
            {isLoading && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            )}
            {error && <p className="error">Error: {error}</p>}
            {apiTest && (
                <pre style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    overflow: 'auto',
                    margin: '10px 0'
                }}>
                    {JSON.stringify(apiTest, null, 2)}
                </pre>
            )}
        </div>
    );
};

export default TestEnv; 