import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';
import type { Priority, TaskFilters as Filters, TaskStatus } from '../types';
import { useAssignees } from '../hooks/useAssignees';
import { COLUMNS, PRIORITY_LABEL } from '../utils/constants';

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  active: boolean;
  hideAssignee?: boolean;
}

const FMT = 'YYYY-MM-DD';

export default function TaskFilters({ filters, onChange, onReset, active, hideAssignee }: Props) {
  const assignees = useAssignees();

  return (
    <div className="filters" role="search" aria-label="Search and filter tasks">
      <Input
        allowClear
        className="filters__search"
        prefix={<SearchOutlined />}
        placeholder="Search by task title…"
        aria-label="Search tasks by title"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
      />
      <Select<Priority>
        allowClear
        placeholder="Priority"
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(v) => onChange({ priority: v })}
        options={(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
      />
      {!hideAssignee && (
        <Select<string>
          allowClear
          placeholder="Assignee"
          aria-label="Filter by assignee"
          value={filters.assignee}
          onChange={(v) => onChange({ assignee: v })}
          options={[{ value: '__unassigned__', label: 'Unassigned' }, ...assignees.map((a) => ({ value: a, label: a }))]}
        />
      )}
      <Select<TaskStatus>
        allowClear
        placeholder="Status"
        aria-label="Filter by status"
        value={filters.status}
        onChange={(v) => onChange({ status: v })}
        options={COLUMNS.map((c) => ({ value: c.id, label: c.title }))}
      />
      <DatePicker.RangePicker
        className="filters__range"
        aria-label="Filter by due date"
        placeholder={['Due from', 'Due to']}
        value={filters.dueRange ? [dayjs(filters.dueRange[0]), dayjs(filters.dueRange[1])] : null}
        onChange={(range) =>
          onChange({ dueRange: range && range[0] && range[1] ? [range[0].format(FMT), range[1].format(FMT)] : undefined })
        }
        presets={[
          { label: 'Today', value: [dayjs(), dayjs()] },
          { label: 'Next 7 days', value: [dayjs(), dayjs().add(7, 'day')] },
          { label: 'This month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
        ]}
      />
      <Button icon={<ClearOutlined />} onClick={onReset} disabled={!active}>
        Clear
      </Button>
    </div>
  );
}
