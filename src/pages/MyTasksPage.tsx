import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Empty, Select, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import PriorityTag from '../components/PriorityTag';
import TaskFilters from '../components/TaskFilters';
import TaskFormModal from '../components/TaskFormModal';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { fullName } from '../hooks/useAssignees';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskModal } from '../hooks/useTaskModal';
import type { Task, TaskStatus } from '../types';
import { COLUMNS, STATUS_LABEL } from '../utils/constants';
import { isOverdue } from '../utils/tasks';

export default function MyTasksPage() {
  const { user } = useAuth();
  const me = fullName(user);
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { modal: confirmModal, message } = App.useApp();
  const modal = useTaskModal();

  const mine = useMemo(() => tasks.filter((t) => t.assignee === me), [tasks, me]);
  const { filters, patch, reset, filtered, active } = useTaskFilters(mine);

  const columns: ColumnsType<Task> = [
    {
      title: 'Task',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_, t) => (
        <div>
          <strong>{t.title}</strong>
          <div className="cell-desc">{t.description}</div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 110,
      sorter: (a, b) => ['low', 'medium', 'high'].indexOf(a.priority) - ['low', 'medium', 'high'].indexOf(b.priority),
      render: (_, t) => <PriorityTag priority={t.priority} />,
    },
    {
      title: 'Due date',
      dataIndex: 'dueDate',
      width: 140,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.dueDate.localeCompare(b.dueDate),
      render: (_, t) => (
        <span className={isOverdue(t) ? 'is-overdue' : ''}>{dayjs(t.dueDate).format('DD MMM YYYY')}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      render: (_, t) => (
        <Select<TaskStatus>
          size="small"
          value={t.status}
          style={{ width: 130 }}
          aria-label={`Change status of ${t.title}`}
          options={COLUMNS.map((c) => ({ value: c.id, label: c.title }))}
          onChange={(s) => {
            updateTask(t.id, { status: s });
            message.success(`Moved to ${STATUS_LABEL[s]}`);
          }}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 96,
      render: (_, t) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} aria-label={`Edit ${t.title}`} onClick={() => modal.openEdit(t)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${t.title}`}
              onClick={() =>
                confirmModal.confirm({
                  title: 'Delete this task?',
                  content: `"${t.title}" will be permanently removed.`,
                  okText: 'Delete',
                  okButtonProps: { danger: true },
                  centered: true,
                  onOk: () => {
                    deleteTask(t.id);
                    message.success('Task deleted');
                  },
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1 className="page__title">My Tasks</h1>
          <p className="page__subtitle">Tasks assigned to {me ?? 'you'}.</p>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => modal.openCreate()}>
          Add Task
        </Button>
      </div>

      <TaskFilters filters={filters} onChange={patch} onReset={reset} active={active} hideAssignee />

      <div className="table-wrap">
        <Table<Task>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          scroll={{ x: 760 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={active ? 'No tasks match your filters' : 'Nothing assigned to you yet'}
              />
            ),
          }}
        />
      </div>

      <TaskFormModal
        open={modal.open}
        task={modal.editing}
        defaultStatus={modal.defaultStatus}
        onCancel={modal.close}
        onSubmit={(input, id) => {
          if (id) {
            updateTask(id, input);
            message.success('Task updated');
          } else {
            addTask({ ...input, assignee: input.assignee ?? me });
            message.success('Task created');
          }
          modal.close();
        }}
      />
    </div>
  );
}
