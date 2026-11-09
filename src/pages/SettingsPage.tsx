import { App, Avatar, Button, Card, Descriptions, Switch } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { useThemeMode } from '../context/ThemeContext';
import { fullName } from '../hooks/useAssignees';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { mode, setMode } = useThemeMode();
  const { resetToSample, clearAll, tasks } = useTasks();
  const { modal, message } = App.useApp();

  const confirm = (title: string, content: string, action: () => void, ok: string) =>
    modal.confirm({ title, content, okText: ok, okButtonProps: { danger: true }, centered: true, onOk: action });

  return (
    <div className="page page--narrow">
      <div className="page__head">
        <div>
          <h1 className="page__title">Settings</h1>
          <p className="page__subtitle">Manage your profile, appearance and local data.</p>
        </div>
      </div>

      <Card title="Profile" variant="borderless" className="settings-card">
        <div className="profile">
          <Avatar size={64} src={user?.image}>{user?.firstName?.[0]}</Avatar>
          <Descriptions column={1} size="small" colon={false}>
            <Descriptions.Item label="Name">{fullName(user)}</Descriptions.Item>
            <Descriptions.Item label="Username">@{user?.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      <Card title="Appearance" variant="borderless" className="settings-card">
        <div className="setting-row">
          <div>
            <strong>Dark mode</strong>
            <div className="muted">Use a darker colour palette.</div>
          </div>
          <Switch checked={mode === 'dark'} onChange={(c) => setMode(c ? 'dark' : 'light')} aria-label="Toggle dark mode" />
        </div>
      </Card>

      <Card title="Data" variant="borderless" className="settings-card">
        <div className="setting-row">
          <div>
            <strong>Reset sample data</strong>
            <div className="muted">Replace all {tasks.length} tasks with the demo set.</div>
          </div>
          <Button
            onClick={() =>
              confirm('Reset to sample data?', 'Your current tasks will be replaced.', () => {
                resetToSample();
                message.success('Sample data restored');
              }, 'Reset')
            }
          >
            Reset
          </Button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Clear all tasks</strong>
            <div className="muted">Remove every task from this browser.</div>
          </div>
          <Button
            danger
            disabled={tasks.length === 0}
            onClick={() =>
              confirm('Delete all tasks?', 'This cannot be undone.', () => {
                clearAll();
                message.success('All tasks deleted');
              }, 'Delete all')
            }
          >
            Clear
          </Button>
        </div>
      </Card>

      <Card title="Session" variant="borderless" className="settings-card">
        <div className="setting-row">
          <div>
            <strong>Sign out</strong>
            <div className="muted">End your session on this device.</div>
          </div>
          <Button danger onClick={logout}>Logout</Button>
        </div>
      </Card>
    </div>
  );
}
