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
import { colors, cardStyles, buttonStyles, modalStyles, gradients } from '../../styles/theme';

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

    const featureCards = [
        {
            icon: <BulbOutlined style={{ fontSize: '32px', color: colors.primary, filter: 'drop-shadow(0 0 10px rgba(24, 144, 255, 0.5))' }} />,
            title: 'AI Suggestions',
            description: 'Get personalized chore suggestions based on patterns and preferences.',
            action: handleGetSuggestions,
            loading: loading.suggestions,
            buttonText: 'Suggestions',
            gradient: gradients.primary
        },
        {
            icon: <CalendarOutlined style={{ fontSize: '32px', color: colors.success, filter: 'drop-shadow(0 0 10px rgba(82, 196, 26, 0.5))' }} />,
            title: 'Smart Schedule',
            description: 'Generate an optimized schedule based on everyone\'s availability and preferences.',
            action: handleGetSmartSchedule,
            loading: loading.schedule,
            buttonText: 'Generate Schedule',
            gradient: gradients.success
        },
        {
            icon: <CloudOutlined style={{ fontSize: '32px', color: colors.warning, filter: 'drop-shadow(0 0 10px rgba(250, 173, 20, 0.5))' }} />,
            title: 'Weather Aware',
            description: 'Automatically adjust outdoor chores based on weather conditions.',
            action: handleWeatherAdjust,
            loading: loading.weather,
            buttonText: 'Check Weather',
            gradient: gradients.warning
        },
        {
            icon: <SwapOutlined style={{ fontSize: '32px', color: colors.danger, filter: 'drop-shadow(0 0 10px rgba(255, 77, 79, 0.5))' }} />,
            title: 'Chore Rotation',
            description: 'Automatically rotate chores among family members for fairness.',
            action: handleRotateChores,
            loading: loading.rotation,
            buttonText: 'Rotate Chores',
            gradient: gradients.danger
        }
    ];

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
            <Title level={2} style={{
                color: colors.text.primary,
                marginBottom: '32px',
                textAlign: 'center',
                fontSize: '2.5rem',
                fontWeight: '600',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
                Smart Features
            </Title>

            <Row gutter={[24, 24]}>
                {featureCards.map((card, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            hoverable
                            style={{
                                ...cardStyles,
                                background: `linear-gradient(135deg, ${colors.background.glass} 0%, ${colors.background.dark} 100%)`
                            }}
                            bodyStyle={{
                                padding: '24px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '16px',
                                    padding: '16px',
                                    background: card.gradient,
                                    borderRadius: '50%',
                                    width: '64px',
                                    height: '64px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    {card.icon}
                                </div>
                                <Title level={4} style={{
                                    color: colors.text.primary,
                                    margin: '0',
                                    textAlign: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {card.title}
                                </Title>
                                <Paragraph style={{
                                    color: colors.text.secondary,
                                    textAlign: 'center',
                                    fontSize: '1rem',
                                    flex: 1
                                }}>
                                    {card.description}
                                </Paragraph>
                                <Button
                                    type="primary"
                                    onClick={card.action}
                                    loading={card.loading}
                                    style={{
                                        ...buttonStyles,
                                        width: '100%',
                                        background: card.gradient,
                                        border: 'none'
                                    }}
                                >
                                    {card.buttonText}
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={<Text style={{ color: colors.text.primary }}>{modalTitle}</Text>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                style={{ top: 20 }}
                bodyStyle={{
                    ...modalStyles.content,
                    background: `linear-gradient(135deg, ${colors.background.glass} 0%, ${colors.background.dark} 100%)`
                }}
                width={800}
            >
                {modalContent}
            </Modal>
        </div>
    );
};

export default SmartFeatures; 