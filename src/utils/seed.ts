import dayjs from 'dayjs';
import type { Task } from '../types';

const d = (offset: number) => dayjs().add(offset, 'day').format('YYYY-MM-DD');
const ts = () => new Date().toISOString();

/** Sample data shown the first time the app is opened. */
export function createSeedTasks(): Task[] {
  const base = (
    n: number,
    title: string,
    description: string,
    priority: Task['priority'],
    status: Task['status'],
    due: number,
    assignee?: string,
  ): Task => ({
    id: `seed-${n}`,
    title,
    description,
    priority,
    status,
    dueDate: d(due),
    assignee,
    createdAt: ts(),
    updatedAt: ts(),
  });

  return [
    base(1, 'Research competitor onboarding flows', 'Review 5 competitor products and document their onboarding steps.', 'low', 'backlog', 14, 'Sophia Brown'),
    base(2, 'Define analytics event taxonomy', 'Agree on naming conventions for product analytics events.', 'medium', 'backlog', 10, 'James Davis'),
    base(3, 'Set up CI pipeline', 'Configure lint, type-check and unit tests on every pull request.', 'high', 'todo', 3, 'Emily Johnson'),
    base(4, 'Design empty states', 'Create friendly empty-state illustrations for the main screens.', 'medium', 'todo', 5, 'Olivia Martin'),
    base(5, 'Write API integration docs', 'Document authentication and token refresh behaviour for the team.', 'low', 'todo', 7),
    base(6, 'Implement Kanban drag & drop', 'Allow cards to move between columns and persist the new status.', 'high', 'in_progress', 2, 'Emily Johnson'),
    base(7, 'Responsive layout QA', 'Verify the dashboard on desktop, tablet and mobile breakpoints.', 'medium', 'in_progress', 1, 'Michael Williams'),
    base(8, 'Fix overdue invoice report', 'The monthly report ignores invoices with a missing due date.', 'high', 'in_progress', -2, 'James Davis'),
    base(9, 'Create project repository', 'Initialise the repo, branching strategy and contribution guide.', 'low', 'done', -6, 'Emily Johnson'),
    base(10, 'Login page UI', 'Implement login form with validation and error feedback.', 'medium', 'done', -3, 'Sophia Brown'),
  ];
}
