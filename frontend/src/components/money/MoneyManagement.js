import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tabs, List, Progress, Button, Modal } from 'antd';
import {
    PiggyBankOutlined,
    BookOutlined,
    TrophyOutlined,
    DollarOutlined
} from '@ant-design/icons';

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

    const showLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setLessonModalVisible(true);
    };

    return (
        <div className="money-management">
            <Title level={2}>Money Management</Title>
            <Text type="secondary">Learn about money, saving, and smart spending</Text>

            <Tabs defaultActiveKey="1" style={{ marginTop: '20px' }}>
                <TabPane
                    tab={
                        <span>
                            <BookOutlined />
                            Financial Education
                        </span>
                    }
                    key="1"
                >
                    <List
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
                                    onClick={() => showLessonModal(lesson)}
                                >
                                    <Title level={4}>{lesson.title}</Title>
                                    <Paragraph>{lesson.content}</Paragraph>
                                    <Text type="secondary">Level: {lesson.level}</Text>
                                    <br />
                                    <Text type="secondary">Duration: {lesson.duration}</Text>
                                    <br />
                                    <Text type="success">Earn {lesson.points} points</Text>
                                </Card>
                            </List.Item>
                        )}
                    />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <PiggyBankOutlined />
                            Savings Goals
                        </span>
                    }
                    key="2"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Card title="Current Savings">
                                <Title level={2}>$45.00</Title>
                                <Progress percent={45} status="active" />
                                <Text type="secondary">Goal: $100.00</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card title="Money Tips">
                                <List
                                    size="small"
                                    dataSource={moneyTips}
                                    renderItem={tip => (
                                        <List.Item>
                                            <Text>{tip}</Text>
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
                                <Card>
                                    <Title level={4}>{challenge.title}</Title>
                                    <Paragraph>{challenge.description}</Paragraph>
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
                    <Card title="Recent Earnings">
                        <List
                            size="large"
                            dataSource={[
                                { date: '2023-11-01', amount: 5.00, source: 'Completed Chores' },
                                { date: '2023-11-03', amount: 10.00, source: 'Weekly Allowance' },
                                { date: '2023-11-05', amount: 3.00, source: 'Extra Help' },
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={`$${item.amount.toFixed(2)}`}
                                        description={item.source}
                                    />
                                    <Text type="secondary">{item.date}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            <Modal
                title={selectedLesson?.title}
                visible={lessonModalVisible}
                onCancel={() => setLessonModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setLessonModalVisible(false)}>
                        Close
                    </Button>,
                    <Button key="start" type="primary">
                        Start Lesson
                    </Button>
                ]}
            >
                {selectedLesson && (
                    <>
                        <Paragraph>{selectedLesson.content}</Paragraph>
                        <Text strong>Level: </Text>
                        <Text>{selectedLesson.level}</Text>
                        <br />
                        <Text strong>Duration: </Text>
                        <Text>{selectedLesson.duration}</Text>
                        <br />
                        <Text strong>Points: </Text>
                        <Text>{selectedLesson.points}</Text>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default MoneyManagement; 