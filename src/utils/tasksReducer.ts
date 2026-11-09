import type { Task, TaskInput, TaskStatus } from '../types';
import { generateId } from './tasks';

export type TasksAction =
  | { type: 'add'; input: TaskInput }
  | { type: 'update'; id: string; changes: Partial<TaskInput> }
  | { type: 'delete'; id: string }
  | { type: 'move'; id: string; toStatus: TaskStatus; overId?: string | null }
  | { type: 'replace'; tasks: Task[] };

/**
 * Task order in the array is the display order inside each column.
 * `move` re-positions a task: before `overId` when it is given, otherwise at the
 * end of the target column.
 */
export function tasksReducer(state: Task[], action: TasksAction): Task[] {
  const now = new Date().toISOString();
  switch (action.type) {
    case 'add':
      return [...state, { ...action.input, id: generateId(), createdAt: now, updatedAt: now }];

    case 'update':
      return state.map((t) => (t.id === action.id ? { ...t, ...action.changes, updatedAt: now } : t));

    case 'delete':
      return state.filter((t) => t.id !== action.id);

    case 'replace':
      return action.tasks;

    case 'move': {
      const active = state.find((t) => t.id === action.id);
      if (!active) return state;
      if (action.overId === action.id) return state;

      const moved: Task =
        active.status === action.toStatus ? active : { ...active, status: action.toStatus, updatedAt: now };
      const rest = state.filter((t) => t.id !== action.id);

      let index = -1;
      if (action.overId) index = rest.findIndex((t) => t.id === action.overId);
      if (index === -1) {
        // append after the last task of the target column
        let last = -1;
        rest.forEach((t, i) => {
          if (t.status === action.toStatus) last = i;
        });
        index = last === -1 ? rest.length : last + 1;
      } else if (active.status === action.toStatus) {
        // same column: place relative to the original position (dnd-kit arrayMove semantics)
        const from = state.findIndex((t) => t.id === action.id);
        const overOriginal = state.findIndex((t) => t.id === action.overId);
        if (from < overOriginal) index += 1;
      }
      const next = [...rest];
      next.splice(index, 0, moved);
      return next;
    }
    default:
      return state;
  }
}
