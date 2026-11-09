import { PlusOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge, Button, Empty } from 'antd';
import type { Task } from '../types';
import type { ColumnMeta } from '../utils/constants';
import TaskCard, { type TaskCardActions } from './TaskCard';

interface Props extends TaskCardActions {
  column: ColumnMeta;
  tasks: Task[];
  filtered: boolean;
  onAdd: () => void;
}

export default function KanbanColumn({ column, tasks, filtered, onAdd, ...actions }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', status: column.id } });

  return (
    <section className={`kanban-col ${isOver ? 'is-over' : ''}`} aria-label={`${column.title} column`} data-testid={`column-${column.id}`}>
      <header className="kanban-col__header">
        <span className="kanban-col__dot" style={{ background: column.color }} />
        <h3 className="kanban-col__title">{column.title}</h3>
        <Badge count={tasks.length} showZero color={column.color} overflowCount={99} />
        <Button
          type="text"
          size="small"
          className="kanban-col__add"
          icon={<PlusOutlined />}
          onClick={onAdd}
          aria-label={`Add task to ${column.title}`}
        />
      </header>
      <div ref={setNodeRef} className="kanban-col__body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} {...actions} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="kanban-col__empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={filtered ? 'No matching tasks' : 'No tasks here yet'}
            />
          </div>
        )}
      </div>
    </section>
  );
}
