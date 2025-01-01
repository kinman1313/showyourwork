import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, Space, message } from 'antd';
import {
    BulbOutlined,
    CalendarOutlined,
    CloudOutlined,
    SwapOutlined,
    AutoComplete
} from '@ant-design/icons';
import {
    getChoreSuggestions,
    getSmartSchedule,
    adjustWeatherSchedule,
    rotateChores
} from '../../api';

const { Title, Text, Paragraph } = Typography;

const SmartFeatures = () => {
    const [loading, setLoading] = useState({
        suggestions: false,
        schedule: false,
        weather: false,
        rotation: false
    });

    const darkGlassStyle = {
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
    };

    const cardStyle = {
        ...darkGlassStyle,
        height: '100%',
        '& .ant-card-head': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
    };

    const handleGetSuggestions = async () => {
        try {
            setLoading(prev => ({ ...prev, suggestions: true }));
            await getChoreSuggestions();
            message.success('AI has generated new chore suggestions!');
        } catch (error) {
            message.error('Failed to get suggestions');
        } finally {
            setLoading(prev => ({ ...prev, suggestions: false }));
        }
    };

    const handleGetSmartSchedule = async () => {
        try {
            setLoading(prev => ({ ...prev, schedule: true }));
            await getSmartSchedule();
            message.success('Smart schedule has been generated!');
        } catch (error) {
            message.error('Failed to generate smart schedule');
        } finally {
            setLoading(prev => ({ ...prev, schedule: false }));
        }
    };

    const handleWeatherAdjust = async () => {
        try {
            setLoading(prev => ({ ...prev, weather: true }));
            await adjustWeatherSchedule();
            message.success('Schedule adjusted based on weather!');
        } catch (error) {
            message.error('Failed to adjust for weather');
        } finally {
            setLoading(prev => ({ ...prev, weather: false }));
        }
    };

    const handleRotateChores = async () => {
        try {
            setLoading(prev => ({ ...prev, rotation: true }));
            await rotateChores();
            message.success('Chores have been rotated!');
        } catch (error) {
            message.error('Failed to rotate chores');
        } finally {
            setLoading(prev => ({ ...prev, rotation: false }));
        }
    };

    return (
        <div className="smart-features">
            <Title level={2} style={{ color: '#fff', marginBottom: '24px' }}>
                Smart Features
            </Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        style={cardStyle}
                        bodyStyle={{ color: '#fff' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <BulbOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                            <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                AI Suggestions
                            </Title>
                            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                Get personalized chore suggestions based on your family's patterns and preferences.
                            </Paragraph>
                            <Button
                                type="primary"
                                onClick={handleGetSuggestions}
                                loading={loading.suggestions}
                                style={{ width: '100%' }}
                            >
                                Get Suggestions
                            </Button>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        style={cardStyle}
                        bodyStyle={{ color: '#fff' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                            <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                Smart Schedule
                            </Title>
                            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                Generate an optimized schedule based on everyone's availability and preferences.
                            </Paragraph>
                            <Button
                                type="primary"
                                onClick={handleGetSmartSchedule}
                                loading={loading.schedule}
                                style={{ width: '100%' }}
                            >
                                Generate Schedule
                            </Button>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        style={cardStyle}
                        bodyStyle={{ color: '#fff' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <CloudOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                            <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                Weather Aware
                            </Title>
                            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                Automatically adjust outdoor chores based on weather conditions.
                            </Paragraph>
                            <Button
                                type="primary"
                                onClick={handleWeatherAdjust}
                                loading={loading.weather}
                                style={{ width: '100%' }}
                            >
                                Check Weather
                            </Button>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        style={cardStyle}
                        bodyStyle={{ color: '#fff' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <SwapOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                            <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                Chore Rotation
                            </Title>
                            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                Automatically rotate chores among family members for fairness.
                            </Paragraph>
                            <Button
                                type="primary"
                                onClick={handleRotateChores}
                                loading={loading.rotation}
                                style={{ width: '100%' }}
                            >
                                Rotate Chores
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SmartFeatures; 