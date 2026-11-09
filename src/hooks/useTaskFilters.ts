import { useCallback, useMemo, useState } from 'react';
import type { Task, TaskFilters } from '../types';
import { EMPTY_FILTERS, filterTasks, hasActiveFilters } from '../utils/tasks';
import { useDebounce } from './useDebounce';

/** Holds filter state and returns the tasks matching every active filter. */
export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 200);

  const filtered = useMemo(
    () => filterTasks(tasks, { ...filters, search: debouncedSearch }),
    [tasks, filters, debouncedSearch],
  );

  const patch = useCallback((p: Partial<TaskFilters>) => setFilters((f) => ({ ...f, ...p })), []);
  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  return { filters, patch, reset, filtered, active: hasActiveFilters(filters) };
}
