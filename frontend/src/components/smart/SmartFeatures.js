import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, Space, message, Modal, List } from 'antd';
import {
    BulbOutlined,
    CalendarOutlined,
    CloudOutlined,
    SwapOutlined
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

    const [results, setResults] = useState({
        suggestions: null,
        schedule: null,
        weather: null,
        rotation: null
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState('');

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

    const showResults = (title, content) => {
        setModalTitle(title);
        setModalContent(content);
        setModalVisible(true);
    };

    const handleGetSuggestions = async () => {
        try {
            setLoading(prev => ({ ...prev, suggestions: true }));
            const response = await getChoreSuggestions();
            setResults(prev => ({ ...prev, suggestions: response.data.suggestions }));
            showResults('AI Suggestions', (
                <List
                    dataSource={response.data.suggestions}
                    renderItem={item => (
                        <List.Item>
                            <Text style={{ color: '#fff' }}>{item}</Text>
                        </List.Item>
                    )}
                />
            ));
        } catch (error) {
            message.error('Failed to get suggestions');
        } finally {
            setLoading(prev => ({ ...prev, suggestions: false }));
        }
    };

    const handleGetSmartSchedule = async () => {
        try {
            setLoading(prev => ({ ...prev, schedule: true }));
            const response = await getSmartSchedule();
            setResults(prev => ({ ...prev, schedule: response.data }));
            showResults('Smart Schedule', (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text strong style={{ color: '#fff' }}>Best Times:</Text>
                        <List
                            dataSource={response.data.bestTimes}
                            renderItem={time => (
                                <List.Item>
                                    <Text style={{ color: '#fff' }}>
                                        {time.displayHour}:00 {time.period}
                                    </Text>
                                </List.Item>
                            )}
                        />
                    </div>
                    <div>
                        <Text strong style={{ color: '#fff' }}>Recommended Days:</Text>
                        <List
                            dataSource={response.data.recommendedDays}
                            renderItem={day => (
                                <List.Item>
                                    <Text style={{ color: '#fff' }}>{day}</Text>
                                </List.Item>
                            )}
                        />
                    </div>
                    <div>
                        <Text strong style={{ color: '#fff' }}>Average Duration:</Text>
                        <Text style={{ color: '#fff' }}> {response.data.estimatedDuration} minutes</Text>
                    </div>
                    <div>
                        <Text strong style={{ color: '#fff' }}>Success Rate:</Text>
                        <Text style={{ color: '#fff' }}> {response.data.successRate}%</Text>
                    </div>
                </Space>
            ));
        } catch (error) {
            message.error('Failed to generate smart schedule');
        } finally {
            setLoading(prev => ({ ...prev, schedule: false }));
        }
    };

    const handleWeatherAdjust = async () => {
        try {
            setLoading(prev => ({ ...prev, weather: true }));
            const response = await adjustWeatherSchedule();
            setResults(prev => ({ ...prev, weather: response.data }));
            showResults('Weather Recommendations', (
                <List
                    dataSource={response.data.recommendations}
                    renderItem={item => (
                        <List.Item>
                            <Space direction="vertical">
                                <Text strong style={{ color: '#fff' }}>{item.date}</Text>
                                <Text style={{ color: '#fff' }}>
                                    {item.conditions}, {item.temperature}°C
                                </Text>
                                <Text type={item.suitable ? "success" : "warning"}>
                                    {item.recommendation}
                                </Text>
                            </Space>
                        </List.Item>
                    )}
                />
            ));
        } catch (error) {
            message.error('Failed to check weather conditions');
        } finally {
            setLoading(prev => ({ ...prev, weather: false }));
        }
    };

    const handleRotateChores = async () => {
        try {
            setLoading(prev => ({ ...prev, rotation: true }));
            const response = await rotateChores();
            setResults(prev => ({ ...prev, rotation: response.data }));
            showResults('Chore Rotation Results', (
                <List
                    dataSource={Object.entries(response.data)}
                    renderItem={([userId, chores]) => (
                        <List.Item>
                            <Space direction="vertical">
                                <Text strong style={{ color: '#fff' }}>Family Member {userId}</Text>
                                <List
                                    size="small"
                                    dataSource={chores}
                                    renderItem={chore => (
                                        <List.Item>
                                            <Text style={{ color: '#fff' }}>{chore.title}</Text>
                                        </List.Item>
                                    )}
                                />
                            </Space>
                        </List.Item>
                    )}
                />
            ));
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

            <Modal
                title={<Text style={{ color: '#fff' }}>{modalTitle}</Text>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                style={{ top: 20 }}
                bodyStyle={{ ...darkGlassStyle, maxHeight: '70vh', overflowY: 'auto' }}
            >
                {modalContent}
            </Modal>
        </div>
    );
};

export default SmartFeatures; 