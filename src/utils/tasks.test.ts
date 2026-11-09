import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { computeStats, filterTasks, groupByStatus } from './tasks';
import { tasksReducer } from './tasksReducer';

const mk = (id: string, status: Task['status'], over: Partial<Task> = {}): Task => ({
  id, title: `Task ${id}`, description: 'd', priority: 'medium', status,
  dueDate: dayjs().add(3, 'day').format('YYYY-MM-DD'), createdAt: '', updatedAt: '', ...over,
});

describe('tasksReducer', () => {
  it('adds a task with a unique id and timestamps', () => {
    let s: Task[] = [];
    const input = { title: 'A', description: 'x', priority: 'low' as const, status: 'todo' as const, dueDate: '2030-01-01' };
    s = tasksReducer(s, { type: 'add', input });
    s = tasksReducer(s, { type: 'add', input });
    expect(s).toHaveLength(2);
    expect(s[0].id).not.toBe(s[1].id);
    expect(s[0].createdAt).toBeTruthy();
  });

  it('updates and deletes', () => {
    let s = [mk('1', 'todo')];
    s = tasksReducer(s, { type: 'update', id: '1', changes: { title: 'New' } });
    expect(s[0].title).toBe('New');
    s = tasksReducer(s, { type: 'delete', id: '1' });
    expect(s).toHaveLength(0);
  });

  it('moves a task to another column (appended at the end)', () => {
    const s = tasksReducer([mk('1', 'todo'), mk('2', 'done'), mk('3', 'done')], { type: 'move', id: '1', toStatus: 'done' });
    expect(s.find((t) => t.id === '1')!.status).toBe('done');
    expect(s.filter((t) => t.status === 'done').map((t) => t.id)).toEqual(['2', '3', '1']);
  });

  it('moves a task before another card in a different column', () => {
    const s = tasksReducer([mk('1', 'todo'), mk('2', 'done'), mk('3', 'done')], { type: 'move', id: '1', toStatus: 'done', overId: '3' });
    expect(s.filter((t) => t.status === 'done').map((t) => t.id)).toEqual(['2', '1', '3']);
  });

  it('re-orders within the same column', () => {
    const s = tasksReducer([mk('1', 'todo'), mk('2', 'todo'), mk('3', 'todo')], { type: 'move', id: '1', toStatus: 'todo', overId: '3' });
    expect(s.map((t) => t.id)).toEqual(['2', '3', '1']);
    const s2 = tasksReducer([mk('1', 'todo'), mk('2', 'todo'), mk('3', 'todo')], { type: 'move', id: '3', toStatus: 'todo', overId: '1' });
    expect(s2.map((t) => t.id)).toEqual(['3', '1', '2']);
  });
});

describe('filters & stats', () => {
  const tasks = [
    mk('1', 'backlog', { title: 'Fix login bug', priority: 'high', assignee: 'Ann' }),
    mk('2', 'in_progress', { title: 'Write docs', priority: 'low', assignee: 'Bob' }),
    mk('3', 'done', { title: 'Login page', priority: 'high' }),
  ];

  it('combines filters with AND', () => {
    expect(filterTasks(tasks, { search: 'login' }).map((t) => t.id)).toEqual(['1', '3']);
    expect(filterTasks(tasks, { search: 'login', priority: 'high', assignee: 'Ann' }).map((t) => t.id)).toEqual(['1']);
    expect(filterTasks(tasks, { search: '', assignee: '__unassigned__' }).map((t) => t.id)).toEqual(['3']);
    expect(filterTasks(tasks, { search: '', status: 'done' })).toHaveLength(1);
  });

  it('filters by due date range', () => {
    const a = mk('a', 'todo', { dueDate: '2030-01-10' });
    const b = mk('b', 'todo', { dueDate: '2030-02-10' });
    expect(filterTasks([a, b], { search: '', dueRange: ['2030-01-01', '2030-01-31'] })).toEqual([a]);
  });

  it('computes stats from data', () => {
    expect(computeStats(tasks)).toMatchObject({ total: 3, backlog: 1, inProgress: 1, completed: 1 });
    expect(computeStats([])).toMatchObject({ total: 0, completed: 0 });
  });

  it('groups by status', () => {
    const g = groupByStatus(tasks);
    expect(g.backlog).toHaveLength(1);
    expect(g.todo).toHaveLength(0);
  });
});
