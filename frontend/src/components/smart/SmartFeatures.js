import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Alert, Spin, List, Typography } from 'antd';
import { BulbOutlined, CloudOutlined, SwapOutlined, ScheduleOutlined } from '@ant-design/icons';
import {
    getChoreSuggestions,
    getSmartSchedule,
    adjustWeatherSchedule,
    rotateChores
} from '../../api';

const { Title, Text } = Typography;

const SmartFeatures = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [schedule, setSchedule] = useState(null);
    const [weatherAdjustments, setWeatherAdjustments] = useState(null);
    const [loading, setLoading] = useState({
        suggestions: false,
        schedule: false,
        weather: false,
        rotation: false
    });
    const [error, setError] = useState(null);

    const handleGetSuggestions = async () => {
        setLoading(prev => ({ ...prev, suggestions: true }));
        try {
            const response = await getChoreSuggestions();
            setSuggestions(response.data);
        } catch (err) {
            setError('Failed to get chore suggestions');
        } finally {
            setLoading(prev => ({ ...prev, suggestions: false }));
        }
    };

    const handleGetSmartSchedule = async () => {
        setLoading(prev => ({ ...prev, schedule: true }));
        try {
            const response = await getSmartSchedule();
            setSchedule(response.data);
        } catch (err) {
            setError('Failed to generate smart schedule');
        } finally {
            setLoading(prev => ({ ...prev, schedule: false }));
        }
    };

    const handleWeatherAdjust = async () => {
        setLoading(prev => ({ ...prev, weather: true }));
        try {
            // You might want to get the location from user's settings or prompt them
            const location = 'New York'; // Default location - could be made dynamic
            const response = await adjustWeatherSchedule(location);
            setWeatherAdjustments(response.data);
        } catch (err) {
            setError('Failed to adjust schedule for weather');
        } finally {
            setLoading(prev => ({ ...prev, weather: false }));
        }
    };

    const handleRotateChores = async () => {
        setLoading(prev => ({ ...prev, rotation: true }));
        try {
            const response = await rotateChores();
            // You might want to show a success message or refresh the chores list
            Alert.success('Chores rotated successfully!');
        } catch (err) {
            setError('Failed to rotate chores');
        } finally {
            setLoading(prev => ({ ...prev, rotation: false }));
        }
    };

    return (
        <div className="smart-features">
            <Title level={2}>Smart Features</Title>
            <Text type="secondary">AI-powered tools to help manage your family's chores</Text>

            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={<><BulbOutlined /> AI Suggestions</>}
                        loading={loading.suggestions}
                    >
                        <Button type="primary" onClick={handleGetSuggestions} block>
                            Get Suggestions
                        </Button>
                        {suggestions.length > 0 && (
                            <List
                                style={{ marginTop: '10px' }}
                                size="small"
                                dataSource={suggestions}
                                renderItem={item => <List.Item>{item}</List.Item>}
                            />
                        )}
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={<><ScheduleOutlined /> Smart Schedule</>}
                        loading={loading.schedule}
                    >
                        <Button type="primary" onClick={handleGetSmartSchedule} block>
                            Generate Schedule
                        </Button>
                        {schedule && (
                            <div style={{ marginTop: '10px' }}>
                                <Text>Recommended Times: {schedule.recommendedTimes.join(', ')}</Text>
                                <br />
                                <Text>Priority: {schedule.priority}</Text>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={<><CloudOutlined /> Weather Adjust</>}
                        loading={loading.weather}
                    >
                        <Button type="primary" onClick={handleWeatherAdjust} block>
                            Check Weather Impact
                        </Button>
                        {weatherAdjustments && (
                            <List
                                style={{ marginTop: '10px' }}
                                size="small"
                                dataSource={weatherAdjustments}
                                renderItem={item => (
                                    <List.Item>
                                        <Text>{item.note}</Text>
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        title={<><SwapOutlined /> Chore Rotation</>}
                        loading={loading.rotation}
                    >
                        <Button type="primary" onClick={handleRotateChores} block>
                            Rotate Chores
                        </Button>
                    </Card>
                </Col>
            </Row>

            {error && (
                <Alert
                    message={error}
                    type="error"
                    closable
                    onClose={() => setError(null)}
                    style={{ marginTop: '20px' }}
                />
            )}
        </div>
    );
};

export default SmartFeatures; 