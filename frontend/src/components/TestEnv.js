import React, { useState, useEffect } from 'react';

const TestEnv = () => {
    const [apiTest, setApiTest] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log('Testing connection to:', process.env.REACT_APP_API_URL);
                const response = await fetch(`${process.env.REACT_APP_API_URL}/test-env`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Oops, we haven't received JSON!");
                }

                const data = await response.json();
                setApiTest(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                console.error('Connection test failed:', err);
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