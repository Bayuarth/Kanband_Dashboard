import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  pointerWithin,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import type { Task, TaskStatus } from '../types';
import { COLUMNS } from '../utils/constants';
import { groupByStatus } from '../utils/tasks';
import KanbanColumn from './KanbanColumn';
import { TaskCardView, type TaskCardActions } from './TaskCard';

interface Props extends TaskCardActions {
  /** every task (used to resolve the dragged card even when filtered out) */
  allTasks: Task[];
  /** tasks to display (after search / filters) */
  visibleTasks: Task[];
  filtersActive: boolean;
  onMoveTask: (id: string, status: TaskStatus, overId?: string | null) => void;
  onAdd: (status: TaskStatus) => void;
}

// Pointer position first (accurate across columns), fall back to closest corners (keyboard).
const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  return pointer.length > 0 ? pointer : closestCorners(args);
};

export default function KanbanBoard({ allTasks, visibleTasks, filtersActive, onMoveTask, onAdd, ...actions }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const grouped = useMemo(() => groupByStatus(visibleTasks), [visibleTasks]);
  const activeTask = activeId ? allTasks.find((t) => t.id === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** Resolve the status a droppable target belongs to. */
  const resolveTarget = useCallback(
    (overId: string, overType?: string): { status: TaskStatus; overTaskId: string | null } | null => {
      if (overType === 'column') return { status: overId as TaskStatus, overTaskId: null };
      const overTask = allTasks.find((t) => t.id === overId);
      return overTask ? { status: overTask.status, overTaskId: overTask.id } : null;
    },
    [allTasks],
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  // While hovering another column, move the card there immediately so the user sees it live.
  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeTaskNow = allTasks.find((t) => t.id === active.id);
    const target = resolveTarget(String(over.id), over.data.current?.type as string | undefined);
    if (!activeTaskNow || !target || activeTaskNow.status === target.status) return;
    onMoveTask(activeTaskNow.id, target.status, target.overTaskId);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const target = resolveTarget(String(over.id), over.data.current?.type as string | undefined);
    if (!target) return;
    // same-column re-ordering (cross-column moves were already applied in dragOver)
    onMoveTask(String(active.id), target.status, target.overTaskId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="kanban-board" role="group" aria-label="Kanban board">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={grouped[col.id]}
            filtered={filtersActive}
            onAdd={() => onAdd(col.id)}
            {...actions}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180 }}>
        {activeTask ? <TaskCardView task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
