import { CalendarOutlined, DeleteOutlined, EditOutlined, MoreOutlined, SwapOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Button, Dropdown, Tooltip, type MenuProps } from 'antd';
import dayjs from 'dayjs';
import { forwardRef, memo, type CSSProperties, type HTMLAttributes } from 'react';
import type { Task, TaskStatus } from '../types';
import { COLUMNS } from '../utils/constants';
import { initials, isOverdue } from '../utils/tasks';
import PriorityTag from './PriorityTag';
import StatusTag from './StatusTag';

export interface TaskCardActions {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
}

interface ViewProps extends HTMLAttributes<HTMLDivElement>, Partial<TaskCardActions> {
  task: Task;
  dragging?: boolean;
  overlay?: boolean;
}

/** Presentational card — reused by the sortable card and by the DragOverlay. */
export const TaskCardView = forwardRef<HTMLDivElement, ViewProps>(function TaskCardView(
  { task, dragging, overlay, onEdit, onDelete, onMove, className, ...rest },
  ref,
) {
  const overdue = isOverdue(task);

  const items: MenuProps['items'] = [
    { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
    {
      key: 'move',
      icon: <SwapOutlined />,
      label: 'Move to',
      children: COLUMNS.filter((c) => c.id !== task.status).map((c) => ({ key: `move:${c.id}`, label: c.title })),
    },
    { type: 'divider' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
  ];

  const onMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    if (key === 'edit') onEdit?.(task);
    else if (key === 'delete') onDelete?.(task);
    else if (key.startsWith('move:')) onMove?.(task, key.slice(5) as TaskStatus);
  };

  return (
    <div
      ref={ref}
      className={['task-card', dragging ? 'task-card--ghost' : '', overlay ? 'task-card--overlay' : '', className ?? ''].join(' ')}
      data-testid={`task-card-${task.id}`}
      {...rest}
    >
      <div className="task-card__top">
        <PriorityTag priority={task.priority} />
        {!overlay && (
          <Dropdown menu={{ items, onClick: onMenuClick }} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              aria-label={`Actions for ${task.title}`}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </Dropdown>
        )}
      </div>
      <h4 className="task-card__title">{task.title}</h4>
      <p className="task-card__desc">{task.description}</p>
      <div className="task-card__meta">
        <span className={`task-card__due ${overdue ? 'is-overdue' : ''}`}>
          <CalendarOutlined /> {dayjs(task.dueDate).format('DD MMM YYYY')}
          {overdue && <span className="task-card__overdue-label"> · Overdue</span>}
        </span>
        <StatusTag status={task.status} />
      </div>
      <div className="task-card__assignee">
        {task.assignee ? (
          <>
            <Avatar size={22} className="avatar-sm">{initials(task.assignee)}</Avatar>
            <Tooltip title={task.assignee}>
              <span className="task-card__assignee-name">{task.assignee}</span>
            </Tooltip>
          </>
        ) : (
          <span className="task-card__unassigned">Unassigned</span>
        )}
      </div>
    </div>
  );
});

function SortableTaskCard({ task, ...actions }: { task: Task } & TaskCardActions) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', status: task.status },
  });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  return (
    <TaskCardView
      ref={setNodeRef}
      style={style}
      task={task}
      dragging={isDragging}
      {...actions}
      {...attributes}
      {...listeners}
      aria-label={`${task.title}, ${task.status.replace('_', ' ')}. Press space to pick up and move.`}
    />
  );
}

export default memo(SortableTaskCard);
