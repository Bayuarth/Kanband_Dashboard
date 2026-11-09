import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useAssignees } from '../hooks/useAssignees';
import type { Priority, Task, TaskInput, TaskStatus } from '../types';
import { COLUMNS, PRIORITY_LABEL } from '../utils/constants';

interface FormValues {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: Dayjs;
  assignee?: string;
}

interface Props {
  open: boolean;
  task: Task | null;
  defaultStatus: TaskStatus;
  onCancel: () => void;
  onSubmit: (input: TaskInput, id?: string) => void;
}

export default function TaskFormModal({ open, task, defaultStatus, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<FormValues>();
  const assignees = useAssignees();
  const isEdit = task !== null;

  // (Re)initialise the form every time the modal opens.
  useEffect(() => {
    if (!open) return;
    if (task) {
      form.setFieldsValue({ ...task, dueDate: dayjs(task.dueDate) });
    } else {
      form.resetFields();
      form.setFieldsValue({ priority: 'medium', status: defaultStatus });
    }
  }, [open, task, defaultStatus, form]);

  const handleOk = async () => {
    let v: FormValues;
    try {
      v = await form.validateFields();
    } catch {
      return; // validation errors are displayed inline by the form
    }
    onSubmit(
      {
        title: v.title.trim(),
        description: v.description.trim(),
        priority: v.priority,
        status: v.status,
        dueDate: v.dueDate.format('YYYY-MM-DD'),
        assignee: v.assignee || undefined,
      },
      task?.id,
    );
  };

  return (
    <Modal
      title={isEdit ? 'Edit task' : 'Add new task'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isEdit ? 'Save changes' : 'Create task'}
      destroyOnClose
      forceRender
      centered
      width={560}
    >
      <Form form={form} layout="vertical" requiredMark="optional" autoComplete="off" style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, whitespace: true, message: 'Please enter a task title' },
            { min: 3, message: 'Title must be at least 3 characters' },
            { max: 80, message: 'Title can be at most 80 characters' },
          ]}
        >
          <Input placeholder="e.g. Prepare sprint review" maxLength={80} showCount />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, whitespace: true, message: 'Please enter a description' },
            { max: 500, message: 'Description can be at most 500 characters' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="Describe what needs to be done" maxLength={500} showCount />
        </Form.Item>
        <div className="form-grid">
          <Form.Item name="priority" label="Priority" rules={[{ required: true, message: 'Select a priority' }]}>
            <Select options={(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Select a status' }]}>
            <Select options={COLUMNS.map((c) => ({ value: c.id, label: c.title }))} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due date" rules={[{ required: true, message: 'Pick a due date' }]}>
            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>
          <Form.Item name="assignee" label="Assignee">
            <Select allowClear placeholder="Unassigned" options={assignees.map((a) => ({ value: a, label: a }))} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
