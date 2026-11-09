import { Tag } from 'antd';
import type { TaskStatus } from '../types';
import { STATUS_COLOR, STATUS_LABEL } from '../utils/constants';

export default function StatusTag({ status }: { status: TaskStatus }) {
  return (
    <Tag bordered={false} style={{ marginInlineEnd: 0, color: STATUS_COLOR[status], background: `${STATUS_COLOR[status]}1f` }}>
      <span className="status-dot" style={{ background: STATUS_COLOR[status] }} />
      {STATUS_LABEL[status]}
    </Tag>
  );
}
