export const colors = {
    primary: '#1890ff',
    secondary: '#52c41a',
    accent: '#faad14',
    danger: '#ff4d4f',
    success: '#52c41a',
    warning: '#faad14',
    info: '#1890ff',
    background: {
        dark: 'rgba(0, 0, 0, 0.8)',
        glass: 'rgba(0, 0, 0, 0.6)',
        light: 'rgba(255, 255, 255, 0.05)'
    },
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.85)',
        muted: 'rgba(255, 255, 255, 0.65)'
    },
    border: 'rgba(255, 255, 255, 0.15)'
};

export const glassEffect = {
    background: colors.background.glass,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
};

export const gradients = {
    primary: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    success: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    warning: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    danger: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)'
};

export const animations = {
    transition: 'all 0.3s ease-in-out',
    hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 30px rgba(0, 0, 0, 0.2)'
    }
};

export const cardStyles = {
    ...glassEffect,
    padding: '24px',
    height: '100%',
    transition: animations.transition,
    '&:hover': {
        ...animations.hover,
        background: colors.background.dark
    }
};

export const buttonStyles = {
    borderRadius: '8px',
    padding: '8px 16px',
    transition: animations.transition,
    '&:hover': animations.hover
};

export const modalStyles = {
    content: {
        ...glassEffect,
        maxWidth: '90%',
        maxHeight: '90vh',
        margin: '20px auto',
        padding: '24px',
        overflow: 'auto'
    },
    header: {
        borderBottom: `1px solid ${colors.border}`,
        marginBottom: '16px',
        paddingBottom: '16px'
    }
}; 