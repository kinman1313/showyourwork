import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tabs, List, Progress, Button, Modal, message, Form, Input, InputNumber, Tag, Tooltip } from 'antd';
import {
    BankOutlined,
    ReadOutlined,
    TrophyOutlined,
    DollarOutlined,
    PlusOutlined,
    InstagramOutlined,
    FacebookOutlined,
    TwitterOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    getTransactions,
    createTransaction,
    getLessonProgress,
    updateLessonProgress,
    getFinancialSummary
} from '../../api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const financialLessons = [
    {
        title: "Saving Basics",
        content: "Learn why saving money is important and how to start saving.",
        level: "Beginner",
        duration: "10 mins",
        points: 50
    },
    {
        title: "Smart Spending",
        content: "Understanding needs vs. wants and making good spending decisions.",
        level: "Beginner",
        duration: "15 mins",
        points: 75
    },
    {
        title: "Budgeting 101",
        content: "Creating and sticking to a basic budget.",
        level: "Intermediate",
        duration: "20 mins",
        points: 100
    },
    {
        title: "Investment Basics",
        content: "Introduction to saving for the future.",
        level: "Advanced",
        duration: "25 mins",
        points: 150
    }
];

const moneyTips = [
    "Save at least 20% of your allowance",
    "Keep track of your spending in a notebook",
    "Set savings goals for things you want",
    "Distinguish between needs and wants before spending",
    "Look for opportunities to earn extra money",
    "Consider donating some money to help others"
];

const challenges = [
    {
        title: "No Spend Week",
        description: "Try not to spend any money for a whole week",
        reward: 200,
        duration: "7 days"
    },
    {
        title: "Save Half",
        description: "Save 50% of your allowance this month",
        reward: 150,
        duration: "30 days"
    },
    {
        title: "Budget Master",
        description: "Create and follow a budget for 2 weeks",
        reward: 300,
        duration: "14 days"
    }
];

const MoneyManagement = () => {
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessonModalVisible, setLessonModalVisible] = useState(false);
    const [loading, setLoading] = useState({
        lessons: false,
        savings: false,
        challenges: false
    });
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [lessonProgress, setLessonProgress] = useState({});
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [showGoalsModal, setShowGoalsModal] = useState(false);
    const [form] = Form.useForm();
    const [chartData, setChartData] = useState({
        savings: [],
        spending: [],
        earnings: []
    });

    useEffect(() => {
        fetchData();
        generateChartData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading({ lessons: true, savings: true, challenges: true });
            const [goalsRes, transactionsRes, summaryRes, progressRes] = await Promise.all([
                getSavingsGoals(),
                getTransactions(),
                getFinancialSummary(),
                getLessonProgress()
            ]);

            setSavingsGoals(goalsRes.data);
            setTransactions(transactionsRes.data);
            setSummary(summaryRes.data);

            // Convert lesson progress array to object for easier lookup
            const progressObj = {};
            progressRes.data.forEach(p => {
                progressObj[p.lessonId] = p;
            });
            setLessonProgress(progressObj);
        } catch (error) {
            message.error('Failed to load money management data');
        } finally {
            setLoading({ lessons: false, savings: false, challenges: false });
        }
    };

    const generateChartData = () => {
        // Generate sample data for charts
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return date.toLocaleString('default', { month: 'short' });
        }).reverse();

        setChartData({
            savings: last6Months.map((month, i) => ({
                month,
                amount: Math.floor(Math.random() * 500) + 100
            })),
            spending: last6Months.map((month, i) => ({
                month,
                amount: Math.floor(Math.random() * 300) + 50
            })),
            earnings: last6Months.map((month, i) => ({
                month,
                amount: Math.floor(Math.random() * 600) + 200
            }))
        });
    };

    const handleStartLesson = async () => {
        if (!selectedLesson) return;

        try {
            await updateLessonProgress({
                lessonId: selectedLesson.title,
                completed: true,
                pointsEarned: selectedLesson.points
            });
            message.success(`Completed ${selectedLesson.title} and earned ${selectedLesson.points} points!`);
            setLessonModalVisible(false);
            fetchData(); // Refresh data
        } catch (error) {
            message.error('Failed to update lesson progress');
        }
    };

    const handleLessonClick = (lesson) => {
        setShowLessonModal(true);
        form.setFieldsValue(lesson);
    };

    const handleShare = (platform) => {
        const achievementText = "I'm learning about money management and saving for my goals! 💰 #ShowYourWork #KidsMoney";
        const url = window.location.href;

        switch (platform) {
            case 'instagram':
                window.open(`https://www.instagram.com/share?url=${url}&caption=${encodeURIComponent(achievementText)}`);
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(achievementText)}`);
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(achievementText)}&url=${url}`);
                break;
            default:
                break;
        }
    };

    const darkGlassStyle = {
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
    };

    const cardStyle = {
        ...darkGlassStyle,
        height: '100%',
    };

    const modalStyle = {
        ...darkGlassStyle,
        '& .ant-modal-content': darkGlassStyle,
        '& .ant-modal-header': {
            ...darkGlassStyle,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '& .ant-modal-footer': {
            ...darkGlassStyle,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
    };

    const lineConfig = {
        data: chartData.savings,
        xField: 'month',
        yField: 'amount',
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            style: {
                fill: '#fff',
            },
        },
        color: '#1890ff',
        smooth: true,
    };

    const pieConfig = {
        data: [
            { type: 'Savings', value: summary?.totalSavings || 0 },
            { type: 'Spending', value: summary?.totalSpending || 0 },
            { type: 'Available', value: summary?.availableFunds || 0 },
        ],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            style: {
                fill: '#fff',
            },
        },
        theme: {
            colors10: ['#1890ff', '#f5222d', '#52c41a'],
        },
    };

    return (
        <div className="money-management">
            <Title level={2} style={{ color: '#fff' }}>Money Management</Title>
            <Text type="secondary">Learn about money, saving, and smart spending</Text>

            <Tabs
                defaultActiveKey="1"
                style={{
                    marginTop: '20px',
                    '& .ant-tabs-nav': {
                        ...darkGlassStyle,
                        marginBottom: '20px'
                    }
                }}
            >
                <TabPane
                    tab={
                        <span>
                            <ReadOutlined />
                            Financial Education
                        </span>
                    }
                    key="1"
                >
                    <List
                        loading={loading.lessons}
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 2,
                            lg: 3,
                            xl: 4,
                            xxl: 4,
                        }}
                        dataSource={financialLessons}
                        renderItem={lesson => (
                            <List.Item>
                                <Card
                                    hoverable
                                    style={cardStyle}
                                    onClick={() => handleLessonClick(lesson)}
                                    bodyStyle={{ color: '#fff' }}
                                >
                                    <Title level={4} style={{ color: '#fff' }}>{lesson.title}</Title>
                                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{lesson.content}</Paragraph>
                                    <Text type="secondary">Level: {lesson.level}</Text>
                                    <br />
                                    <Text type="secondary">Duration: {lesson.duration}</Text>
                                    <br />
                                    <Text type="success">Earn {lesson.points} points</Text>
                                    {lessonProgress[lesson.title]?.completed && (
                                        <div style={{ marginTop: '10px' }}>
                                            <Text type="success">✓ Completed</Text>
                                        </div>
                                    )}
                                </Card>
                            </List.Item>
                        )}
                    />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <BankOutlined />
                            Savings Goals
                        </span>
                    }
                    key="2"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Card
                                title={<Text style={{ color: '#fff' }}>Current Savings</Text>}
                                style={cardStyle}
                                bodyStyle={{ color: '#fff' }}
                            >
                                <Title level={2} style={{ color: '#fff' }}>${summary?.totalSavings || '0.00'}</Title>
                                <Progress
                                    percent={summary?.totalSavings ? (summary.totalSavings / 100) * 100 : 0}
                                    status="active"
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }}
                                />
                                <Text type="secondary">Goal: $100.00</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card
                                title={<Text style={{ color: '#fff' }}>Money Tips</Text>}
                                style={cardStyle}
                                bodyStyle={{ color: '#fff' }}
                            >
                                <List
                                    size="small"
                                    dataSource={moneyTips}
                                    renderItem={tip => (
                                        <List.Item>
                                            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{tip}</Text>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <TrophyOutlined />
                            Money Challenges
                        </span>
                    }
                    key="3"
                >
                    <List
                        loading={loading.challenges}
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 3,
                            lg: 3,
                            xl: 3,
                            xxl: 3,
                        }}
                        dataSource={challenges}
                        renderItem={challenge => (
                            <List.Item>
                                <Card
                                    style={cardStyle}
                                    bodyStyle={{ color: '#fff' }}
                                >
                                    <Title level={4} style={{ color: '#fff' }}>{challenge.title}</Title>
                                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{challenge.description}</Paragraph>
                                    <Text type="secondary">Duration: {challenge.duration}</Text>
                                    <br />
                                    <Text type="success">Reward: {challenge.reward} points</Text>
                                    <br />
                                    <Button type="primary" style={{ marginTop: '10px' }}>
                                        Start Challenge
                                    </Button>
                                </Card>
                            </List.Item>
                        )}
                    />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <DollarOutlined />
                            Earnings History
                        </span>
                    }
                    key="4"
                >
                    <Card
                        title={<Text style={{ color: '#fff' }}>Recent Earnings</Text>}
                        style={cardStyle}
                        bodyStyle={{ color: '#fff' }}
                    >
                        <List
                            loading={loading.transactions}
                            size="large"
                            dataSource={transactions}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Text style={{ color: '#fff' }}>${item.amount.toFixed(2)}</Text>}
                                        description={<Text type="secondary">{item.description}</Text>}
                                    />
                                    <Text type="secondary">{new Date(item.date).toLocaleDateString()}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <DollarOutlined />
                            Financial Overview
                        </span>
                    }
                    key="5"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card
                                title={<Text style={{ color: '#fff' }}>Savings Trend</Text>}
                                style={cardStyle}
                                bodyStyle={{ color: '#fff', height: '300px' }}
                            >
                                <Line {...lineConfig} />
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card
                                title={<Text style={{ color: '#fff' }}>Money Distribution</Text>}
                                style={cardStyle}
                                bodyStyle={{ color: '#fff', height: '300px' }}
                            >
                                <Pie {...pieConfig} />
                            </Card>
                        </Col>
                    </Row>

                    <Card
                        style={{ ...cardStyle, marginTop: '16px' }}
                        bodyStyle={{ color: '#fff' }}
                    >
                        <Row justify="center" gutter={16}>
                            <Col>
                                <Tooltip title="Share on Instagram">
                                    <Button
                                        type="text"
                                        icon={<InstagramOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                                        onClick={() => handleShare('instagram')}
                                    />
                                </Tooltip>
                            </Col>
                            <Col>
                                <Tooltip title="Share on Facebook">
                                    <Button
                                        type="text"
                                        icon={<FacebookOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                                        onClick={() => handleShare('facebook')}
                                    />
                                </Tooltip>
                            </Col>
                            <Col>
                                <Tooltip title="Share on X (Twitter)">
                                    <Button
                                        type="text"
                                        icon={<TwitterOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                                        onClick={() => handleShare('twitter')}
                                    />
                                </Tooltip>
                            </Col>
                        </Row>
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title={selectedLesson?.title}
                open={lessonModalVisible}
                onCancel={() => setLessonModalVisible(false)}
                style={modalStyle}
                footer={[
                    <Button key="back" onClick={() => setLessonModalVisible(false)}>
                        Close
                    </Button>,
                    <Button
                        key="start"
                        type="primary"
                        onClick={handleStartLesson}
                        disabled={lessonProgress[selectedLesson?.title]?.completed}
                    >
                        {lessonProgress[selectedLesson?.title]?.completed ? 'Completed' : 'Start Lesson'}
                    </Button>
                ]}
            >
                {selectedLesson && (
                    <>
                        <Paragraph style={{ color: '#fff' }}>{selectedLesson.content}</Paragraph>
                        <Text strong style={{ color: '#fff' }}>Level: </Text>
                        <Text type="secondary">{selectedLesson.level}</Text>
                        <br />
                        <Text strong style={{ color: '#fff' }}>Duration: </Text>
                        <Text type="secondary">{selectedLesson.duration}</Text>
                        <br />
                        <Text strong style={{ color: '#fff' }}>Points: </Text>
                        <Text type="success">{selectedLesson.points}</Text>
                    </>
                )}
            </Modal>

            <Modal
                title="Financial Lesson"
                open={showLessonModal}
                onCancel={() => {
                    setShowLessonModal(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={async (values) => {
                        try {
                            await updateLessonProgress(values);
                            message.success('Lesson progress updated');
                            setShowLessonModal(false);
                            fetchLessonProgress();
                        } catch (error) {
                            message.error('Failed to update lesson progress');
                        }
                    }}
                >
                    <Form.Item name="title" label="Lesson">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="progress" label="Progress">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Progress
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MoneyManagement; 