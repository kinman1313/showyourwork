import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    List,
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    message
} from 'antd';
import {
    MessageOutlined,
    EyeOutlined,
    PlusOutlined,
    PushpinOutlined,
    LockOutlined
} from '@ant-design/icons';
import { getTopics, createTopic } from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ForumList = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await getTopics();
            setTopics(response.data);
        } catch (error) {
            message.error('Failed to fetch topics');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (values) => {
        try {
            const response = await createTopic(values);
            message.success('Topic created successfully');
            setCreateModalVisible(false);
            form.resetFields();
            setTopics([response.data, ...topics]);
        } catch (error) {
            message.error('Failed to create topic');
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'announcements': return 'red';
            case 'help': return 'blue';
            case 'suggestions': return 'green';
            default: return 'default';
        }
    };

    const darkGlassStyle = {
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
    };

    return (
        <div className="forum-list">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>Forum</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                >
                    New Topic
                </Button>
            </div>

            <List
                loading={loading}
                dataSource={topics}
                renderItem={topic => (
                    <List.Item>
                        <Card
                            style={{
                                width: '100%',
                                ...darkGlassStyle
                            }}
                            bodyStyle={{ padding: '16px' }}
                            hoverable
                            onClick={() => navigate(`/forum/topics/${topic._id}`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <Space align="center">
                                        {topic.isSticky && <PushpinOutlined style={{ color: '#ff4d4f' }} />}
                                        {topic.isClosed && <LockOutlined style={{ color: '#ff4d4f' }} />}
                                        <Title
                                            level={4}
                                            style={{
                                                color: '#fff',
                                                margin: 0
                                            }}
                                        >
                                            {topic.title}
                                        </Title>
                                    </Space>
                                    <div style={{ marginTop: '8px' }}>
                                        <Tag color={getCategoryColor(topic.category)}>
                                            {topic.category}
                                        </Tag>
                                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                                            by {topic.createdBy?.name}
                                        </Text>
                                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                                            • {new Date(topic.createdAt).toLocaleDateString()}
                                        </Text>
                                    </div>
                                </div>
                                <Space size="large">
                                    <Space>
                                        <MessageOutlined />
                                        <Text style={{ color: '#fff' }}>{topic.posts?.length || 0}</Text>
                                    </Space>
                                    <Space>
                                        <EyeOutlined />
                                        <Text style={{ color: '#fff' }}>{topic.views}</Text>
                                    </Space>
                                </Space>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />

            <Modal
                title="Create New Topic"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateTopic}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category' }]}
                    >
                        <Select>
                            <Option value="general">General Discussion</Option>
                            <Option value="help">Help & Support</Option>
                            <Option value="suggestions">Suggestions</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Create Topic
                            </Button>
                            <Button onClick={() => {
                                setCreateModalVisible(false);
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ForumList; 