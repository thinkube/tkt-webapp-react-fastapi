import { CalendarClock, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TkButton, TkBadge } from 'thinkube-style/components/buttons-badges';
import {
  TkCard,
  TkCardHeader,
  TkCardTitle,
  TkCardDescription,
  TkCardContent,
  TkCardFooter,
} from 'thinkube-style/components/cards-data';
import type { Task, TaskPriority, TaskStatus } from '@/stores/useTasksStore';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const STATUS_BADGE: Record<TaskStatus, 'pending' | 'active' | 'healthy'> = {
  todo: 'pending',
  in_progress: 'active',
  done: 'healthy',
};

const PRIORITY_BADGE: Record<TaskPriority, 'pending' | 'warning' | 'unhealthy'> = {
  low: 'pending',
  medium: 'warning',
  high: 'unhealthy',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'task.statusTodo',
  in_progress: 'task.statusInProgress',
  done: 'task.statusDone',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'task.priorityLow',
  medium: 'task.priorityMedium',
  high: 'task.priorityHigh',
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { t, i18n } = useTranslation();

  const formatDate = (value: string) => new Date(value).toLocaleDateString(i18n.resolvedLanguage);

  return (
    <TkCard className="flex flex-col" data-testid="task-card">
      <TkCardHeader>
        <TkCardTitle>{task.title}</TkCardTitle>
        {task.description && <TkCardDescription>{task.description}</TkCardDescription>}
      </TkCardHeader>

      <TkCardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          <TkBadge status={STATUS_BADGE[task.status]}>{t(STATUS_LABEL[task.status])}</TkBadge>
          <TkBadge status={PRIORITY_BADGE[task.priority]}>
            {t(PRIORITY_LABEL[task.priority])}
          </TkBadge>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>
                {t('home.due')}: {formatDate(task.due_date)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {t('home.created')}: {formatDate(task.created_at)}
            </span>
          </div>
        </div>
      </TkCardContent>

      <TkCardFooter className="justify-end gap-2">
        <TkButton intent="ghost" size="sm" onClick={() => onEdit(task)}>
          {t('common.edit')}
        </TkButton>
        <TkButton intent="danger" size="sm" onClick={() => onDelete(task)}>
          {t('common.delete')}
        </TkButton>
      </TkCardFooter>
    </TkCard>
  );
}
