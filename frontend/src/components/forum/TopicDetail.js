import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Input,
    List,
    Avatar,
    message,
    Tooltip,
    Divider
} from 'antd';
import {
    ArrowLeftOutlined,
    LikeOutlined,
    LikeFilled,
    EditOutlined,
    DeleteOutlined,
    PushpinOutlined,
    LockOutlined
} from '@ant-design/icons';
import { getTopic, createPost, updatePost, deletePost, likePost } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TopicDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTopic();
    }, [id]);

    const fetchTopic = async () => {
        try {
            setLoading(true);
            const response = await getTopic(id);
            setTopic(response.data);
        } catch (error) {
            message.error('Failed to fetch topic');
            navigate('/forum');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPost = async () => {
        if (!newPost.trim()) return;

        try {
            setSubmitting(true);
            await createPost(id, { content: newPost });
            setNewPost('');
            fetchTopic();
            message.success('Post added successfully');
        } catch (error) {
            message.error('Failed to add post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePost = async (postId, content) => {
        try {
            await updatePost(id, postId, { content });
            setEditingPost(null);
            fetchTopic();
            message.success('Post updated successfully');
        } catch (error) {
            message.error('Failed to update post');
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await deletePost(id, postId);
            fetchTopic();
            message.success('Post deleted successfully');
        } catch (error) {
            message.error('Failed to delete post');
        }
    };

    const handleLikePost = async (postId) => {
        try {
            await likePost(id, postId);
            fetchTopic();
        } catch (error) {
            message.error('Failed to update like');
        }
    };

    const darkGlassStyle = {
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
    };

    if (loading) {
        return <Card style={darkGlassStyle} loading={true} />;
    }

    return (
        <div className="topic-detail">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/forum')}
                    >
                        Back to Forum
                    </Button>
                </div>

                <Card style={darkGlassStyle} bodyStyle={{ padding: '24px' }}>
                    <Space align="center">
                        {topic.isSticky && <PushpinOutlined style={{ color: '#ff4d4f' }} />}
                        {topic.isClosed && <LockOutlined style={{ color: '#ff4d4f' }} />}
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>
                            {topic.title}
                        </Title>
                    </Space>
                    <div style={{ marginTop: '12px' }}>
                        <Tag color="blue">{topic.category}</Tag>
                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                            Posted by {topic.createdBy?.name}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                            • {new Date(topic.createdAt).toLocaleDateString()}
                        </Text>
                    </div>
                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: '16px' }}>
                        {topic.description}
                    </Paragraph>
                </Card>

                <List
                    itemLayout="vertical"
                    dataSource={topic.posts}
                    renderItem={post => (
                        <List.Item
                            actions={[
                                <Tooltip title="Like">
                                    <Button
                                        type="text"
                                        icon={post.likes?.includes(user?._id) ? <LikeFilled /> : <LikeOutlined />}
                                        onClick={() => handleLikePost(post._id)}
                                    >
                                        {post.likes?.length || 0}
                                    </Button>
                                </Tooltip>,
                                post.userId._id === user?._id && (
                                    <Tooltip title="Edit">
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => setEditingPost(post)}
                                        />
                                    </Tooltip>
                                ),
                                post.userId._id === user?._id && (
                                    <Tooltip title="Delete">
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeletePost(post._id)}
                                        />
                                    </Tooltip>
                                )
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar>{post.userId.name[0]}</Avatar>}
                                title={
                                    <Space>
                                        <Text style={{ color: '#fff' }}>{post.userId.name}</Text>
                                        <Text type="secondary">
                                            {new Date(post.createdAt).toLocaleString()}
                                        </Text>
                                    </Space>
                                }
                                description={
                                    editingPost?._id === post._id ? (
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <TextArea
                                                value={editingPost.content}
                                                onChange={e => setEditingPost({
                                                    ...editingPost,
                                                    content: e.target.value
                                                })}
                                                rows={4}
                                            />
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    onClick={() => handleUpdatePost(post._id, editingPost.content)}
                                                >
                                                    Save
                                                </Button>
                                                <Button onClick={() => setEditingPost(null)}>
                                                    Cancel
                                                </Button>
                                            </Space>
                                        </Space>
                                    ) : (
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                            {post.content}
                                        </Text>
                                    )
                                }
                            />
                        </List.Item>
                    )}
                    style={{ background: 'transparent' }}
                />

                {!topic.isClosed && (
                    <>
                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <Card style={darkGlassStyle}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <TextArea
                                    rows={4}
                                    value={newPost}
                                    onChange={e => setNewPost(e.target.value)}
                                    placeholder="Write your reply..."
                                    disabled={submitting}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleSubmitPost}
                                    loading={submitting}
                                    disabled={!newPost.trim()}
                                >
                                    Post Reply
                                </Button>
                            </Space>
                        </Card>
                    </>
                )}
            </Space>
        </div>
    );
};

export default TopicDetail; 