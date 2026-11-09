import {
  AppstoreOutlined,
  CheckSquareOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Drawer, Dropdown, Grid, Layout, Menu, type MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fullName } from '../hooks/useAssignees';

const { Sider, Header, Content } = Layout;

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/my-tasks': 'My Tasks',
  '/settings': 'Settings',
};

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="brand">
      <img src="/favicon.svg" alt="" width={32} height={32} />
      {!collapsed && <span className="brand__name">TaskFlow</span>}
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const items: MenuProps['items'] = useMemo(
    () => [
      { key: '/', icon: <AppstoreOutlined />, label: 'Dashboard' },
      { key: '/my-tasks', icon: <CheckSquareOutlined />, label: 'My Tasks' },
      { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ],
    [],
  );

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    setDrawerOpen(false);
    if (key === 'logout') {
      logout();
      navigate('/login', { replace: true });
    } else navigate(key);
  };

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={onMenuClick}
      className="side-menu"
    />
  );

  const name = fullName(user) ?? 'User';
  const userMenu: MenuProps = {
    items: [
      { key: 'info', label: <div className="user-info"><strong>{name}</strong><span>{user?.email}</span></div>, disabled: true },
      { type: 'divider' },
      { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        logout();
        navigate('/login', { replace: true });
      } else if (key === 'settings') navigate('/settings');
    },
  };

  return (
    <Layout className="app-shell">
      {!isMobile && (
        <Sider
          width={236}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          className="app-sider"
          theme="light"
          aria-label="Sidebar navigation"
        >
          <Brand collapsed={collapsed} />
          {menu}
        </Sider>
      )}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={250}
          closable={false}
          styles={{ body: { padding: 0 } }}
        >
          <Brand />
          {menu}
        </Drawer>
      )}
      <Layout>
        <Header className="app-header">
          <div className="app-header__left">
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} aria-label="Open navigation" />
            )}
            <span className="app-header__title">{TITLES[location.pathname] ?? 'TaskFlow'}</span>
          </div>
          <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
            <button type="button" className="user-chip" aria-label="User menu" data-testid="user-chip">
              <Avatar src={user?.image} icon={<UserOutlined />} size={34} />
              {!screens.xs && (
                <span className="user-chip__text">
                  <strong>{name}</strong>
                  <small>@{user?.username}</small>
                </span>
              )}
            </button>
          </Dropdown>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
