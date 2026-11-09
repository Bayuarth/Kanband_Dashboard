import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toApiError } from '../api/apiError';
import { useAuth } from '../context/AuthContext';

interface LoginValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login, isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm<LoginValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  if (!initializing && isAuthenticated) return <Navigate to={from} replace />;

  const onFinish = async (values: LoginValues) => {
    setLoading(true);
    setError(null);
    try {
      await login({ username: values.username.trim(), password: values.password });
      navigate(from, { replace: true });
    } catch (e) {
      const err = toApiError(e);
      setError(err.status === 400 ? 'Invalid username or password. Please try again.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <aside className="login__hero" aria-hidden>
        <div className="login__hero-inner">
          <div className="brand brand--light">
            <img src="/favicon.svg" alt="" width={36} height={36} />
            <span className="brand__name">TaskFlow</span>
          </div>
          <h2>Organise work.<br />Ship with clarity.</h2>
          <p>A simple Kanban dashboard to plan, prioritise and track every task from backlog to done.</p>
          <div className="login__mock">
            {['Backlog', 'To Do', 'In Progress', 'Done'].map((c, i) => (
              <div key={c} className="login__mock-col">
                <span>{c}</span>
                {Array.from({ length: 3 - (i % 3) }).map((_, k) => (
                  <i key={k} style={{ width: `${70 + ((i + k) % 3) * 12}%` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="login__panel">
        <div className="login__card">
          <div className="brand login__mobile-brand">
            <img src="/favicon.svg" alt="" width={32} height={32} />
            <span className="brand__name">TaskFlow</span>
          </div>
          <Typography.Title level={2} style={{ marginBottom: 4 }}>Welcome back</Typography.Title>
          <Typography.Paragraph type="secondary">Sign in to continue to your dashboard.</Typography.Paragraph>

          {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} role="alert" data-testid="login-error" />}

          <Form<LoginValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            onValuesChange={() => error && setError(null)}
            autoComplete="on"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, whitespace: true, message: 'Please enter your username' },
                { min: 3, message: 'Username must be at least 3 characters' },
              ]}
            >
              <Input size="large" prefix={<UserOutlined />} placeholder="e.g. emilys" autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="Your password" autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>

          <div className="login__demo">
            <span>Demo account</span>
            <code>emilys</code> / <code>emilyspass</code>
            <Button size="small" type="link" onClick={() => form.setFieldsValue({ username: 'emilys', password: 'emilyspass' })}>
              Fill in
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
