import { Tag } from 'antd';
import type { Priority } from '../types';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../utils/constants';

export default function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <Tag color={PRIORITY_COLOR[priority]} style={{ marginInlineEnd: 0 }}>
      {PRIORITY_LABEL[priority]}
    </Tag>
  );
}
