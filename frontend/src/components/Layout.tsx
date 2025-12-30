import { Layout as AntLayout, Menu, Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined, BookOutlined, RocketOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import './Layout.css';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    setIsHomePage(location.pathname === '/');

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/knowledge',
      icon: <BookOutlined />,
      label: <Link to="/knowledge">知识体系</Link>,
    },
    {
      key: '/problems',
      icon: <DatabaseOutlined />,
      label: <Link to="/problems">题库管理</Link>,
    },
    {
      key: '#',
      icon: <BookOutlined />,
      label: <a href="https://github.com/anthropics/claude-code" target="_blank" rel="noopener noreferrer">#</a>,
    },
  ];

  return (
    <AntLayout className="app-layout">
      <Header className={`app-header ${scrolled ? 'scrolled' : ''} ${isHomePage ? 'home' : ''}`}>
        <div className="header-content">
          <div
            className="logo"
            onClick={() => navigate('/')}
          >
            <span className="logo-icon">∑</span>
            <span className="logo-text">MathTutor</span>
          </div>

          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="header-menu"
          />

          <div className="header-actions">
            {!isHomePage && (
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={() => navigate('/knowledge')}
                className="header-cta"
              >
                开始学习
              </Button>
            )}
          </div>
        </div>
      </Header>

      <Content className={`app-content ${isHomePage ? 'home-content' : ''}`}>
        {children}
      </Content>

      <Footer className="app-footer">
        <div className="footer-content">
          <p>MathTutor ©2024 - AI 智能数学辅导系统</p>
          <p className="footer-links">
            <Link to="/privacy">隐私政策</Link>
            <span>·</span>
            <Link to="/terms">服务条款</Link>
            <span>·</span>
            <Link to="/contact">联系我们</Link>
          </p>
        </div>
      </Footer>
    </AntLayout>
  );
};

export default Layout;
