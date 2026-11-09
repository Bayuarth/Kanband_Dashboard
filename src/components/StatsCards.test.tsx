import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import StatsCards from './StatsCards';

const t = (id: string, status: Task['status']): Task => ({
  id, title: id, description: '', priority: 'low', status, dueDate: '2099-01-01', createdAt: '', updatedAt: '',
});

describe('StatsCards', () => {
  it('derives every figure from the task list', () => {
    render(<StatsCards tasks={[t('1', 'backlog'), t('2', 'backlog'), t('3', 'in_progress'), t('4', 'done'), t('5', 'todo')]} />);
    expect(screen.getByTestId('stat-total')).toHaveTextContent('5');
    expect(screen.getByTestId('stat-backlog')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-progress')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-done')).toHaveTextContent('1');
  });
});
