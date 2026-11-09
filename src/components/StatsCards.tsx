import { CheckCircleOutlined, ClockCircleOutlined, InboxOutlined, ProfileOutlined } from '@ant-design/icons';
import { Card, Col, Progress, Row } from 'antd';
import { useMemo, type ReactNode } from 'react';
import type { Task } from '../types';
import { computeStats } from '../utils/tasks';

interface Props {
  tasks: Task[];
}

function StatCard({ label, value, icon, color, hint, testId }: { label: string; value: number; icon: ReactNode; color: string; hint?: string; testId: string }) {
  return (
    <Card className="stat-card" variant="borderless" data-testid={testId}>
      <div className="stat-card__row">
        <div>
          <div className="stat-card__label">{label}</div>
          <div className="stat-card__value" aria-live="polite">{value}</div>
          {hint && <div className="stat-card__hint">{hint}</div>}
        </div>
        <div className="stat-card__icon" style={{ color, background: `${color}1f` }} aria-hidden>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function StatsCards({ tasks }: Props) {
  const s = useMemo(() => computeStats(tasks), [tasks]);
  const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;

  return (
    <section aria-label="Task statistics">
      <Row gutter={[16, 16]}>
        <Col xs={12} xl={6}>
          <StatCard testId="stat-total" label="Total Tasks" value={s.total} icon={<ProfileOutlined />} color="#4f46e5" hint={s.overdue ? `${s.overdue} overdue` : 'All on schedule'} />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard testId="stat-backlog" label="Backlog Tasks" value={s.backlog} icon={<InboxOutlined />} color="#8c8fa3" hint={`${s.todo} ready to do`} />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard testId="stat-progress" label="In Progress Tasks" value={s.inProgress} icon={<ClockCircleOutlined />} color="#f59e0b" hint="Being worked on" />
        </Col>
        <Col xs={12} xl={6}>
          <StatCard testId="stat-done" label="Completed Tasks" value={s.completed} icon={<CheckCircleOutlined />} color="#10b981" hint={`${pct}% completion`} />
        </Col>
      </Row>
      <Progress percent={pct} showInfo={false} strokeColor={{ from: '#6366f1', to: '#10b981' }} className="stats-progress" aria-label={`${pct}% of tasks completed`} />
    </section>
  );
}
