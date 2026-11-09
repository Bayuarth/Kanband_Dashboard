import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Empty } from 'antd';
import { useCallback } from 'react';
import { useTasks } from '../context/TasksContext';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskModal } from '../hooks/useTaskModal';
import type { Task, TaskInput, TaskStatus } from '../types';
import { STATUS_LABEL } from '../utils/constants';
import KanbanBoard from './KanbanBoard';
import StatsCards from './StatsCards';
import TaskFilters from './TaskFilters';
import TaskFormModal from './TaskFormModal';

/** Stats + filters + Kanban board + create/edit modal (the Dashboard page body). */
export default function TasksWorkspace() {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const { filters, patch, reset, filtered, active } = useTaskFilters(tasks);
  const modal = useTaskModal();
  const { modal: confirmModal, message } = App.useApp();

  const handleSubmit = useCallback(
    (input: TaskInput, id?: string) => {
      if (id) {
        updateTask(id, input);
        message.success('Task updated');
      } else {
        addTask(input);
        message.success('Task created');
      }
      modal.close();
    },
    [addTask, updateTask, message, modal],
  );

  const handleDelete = useCallback(
    (task: Task) => {
      confirmModal.confirm({
        title: 'Delete this task?',
        content: `"${task.title}" will be permanently removed. This action cannot be undone.`,
        okText: 'Delete',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        centered: true,
        onOk: () => {
          deleteTask(task.id);
          message.success('Task deleted');
        },
      });
    },
    [confirmModal, deleteTask, message],
  );

  const handleMove = useCallback(
    (task: Task, status: TaskStatus) => {
      moveTask(task.id, status);
      message.success(`Moved to ${STATUS_LABEL[status]}`);
    },
    [moveTask, message],
  );

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__subtitle">Track progress and move work across your board.</p>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => modal.openCreate()}>
          Add Task
        </Button>
      </div>

      <StatsCards tasks={tasks} />

      <TaskFilters filters={filters} onChange={patch} onReset={reset} active={active} />

      {tasks.length === 0 ? (
        <div className="empty-board" data-testid="empty-state">
          <Empty description="No tasks yet — create your first task to get started.">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => modal.openCreate()}>
              Add Task
            </Button>
          </Empty>
        </div>
      ) : (
        <KanbanBoard
          allTasks={tasks}
          visibleTasks={filtered}
          filtersActive={active}
          onMoveTask={moveTask}
          onAdd={(s) => modal.openCreate(s)}
          onEdit={modal.openEdit}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      )}

      <TaskFormModal
        open={modal.open}
        task={modal.editing}
        defaultStatus={modal.defaultStatus}
        onCancel={modal.close}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
