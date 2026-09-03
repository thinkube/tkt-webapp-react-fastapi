import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TkDialogRoot,
  TkDialogContent,
  TkDialogHeader,
  TkDialogTitle,
  TkDialogFooter,
} from 'thinkube-style/components/modals-overlays';
import { TkButton } from 'thinkube-style/components/buttons-badges';
import {
  TkInput,
  TkLabel,
  TkTextarea,
  TkSelect,
  TkSelectTrigger,
  TkSelectValue,
  TkSelectContent,
  TkSelectItem,
} from 'thinkube-style/components/forms-inputs';
import type { Task, TaskInput, TaskPriority, TaskStatus } from '@/stores/useTasksStore';

interface TaskDialogProps {
  open: boolean;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: TaskInput) => Promise<void>;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
};

/** The date input wants YYYY-MM-DD; the API returns a full ISO timestamp. */
const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

export function TaskDialog({ open, task, onOpenChange, onSubmit }: TaskDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm(
      task
        ? {
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            due_date: toDateInput(task.due_date),
          }
        : EMPTY_FORM,
    );
  }, [open, task]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description,
        status: form.status,
        priority: form.priority,
        ...(form.due_date ? { due_date: new Date(form.due_date).toISOString() } : {}),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TkDialogRoot open={open} onOpenChange={onOpenChange}>
      <TkDialogContent className="max-w-lg">
        <TkDialogHeader>
          <TkDialogTitle>{task ? t('home.editTask') : t('home.createTask')}</TkDialogTitle>
        </TkDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <TkLabel htmlFor="task-title">{t('task.title')}</TkLabel>
            <TkInput
              id="task-title"
              value={form.title}
              required
              placeholder={t('task.titlePlaceholder')}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <TkLabel htmlFor="task-description">{t('task.description')}</TkLabel>
            <TkTextarea
              id="task-description"
              rows={3}
              value={form.description}
              placeholder={t('task.descriptionPlaceholder')}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <TkLabel htmlFor="task-status">{t('task.status')}</TkLabel>
              <TkSelect
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value as TaskStatus })}
              >
                <TkSelectTrigger id="task-status" aria-label={t('task.status')}>
                  <TkSelectValue />
                </TkSelectTrigger>
                <TkSelectContent>
                  <TkSelectItem value="todo">{t('task.statusTodo')}</TkSelectItem>
                  <TkSelectItem value="in_progress">{t('task.statusInProgress')}</TkSelectItem>
                  <TkSelectItem value="done">{t('task.statusDone')}</TkSelectItem>
                </TkSelectContent>
              </TkSelect>
            </div>

            <div className="space-y-2">
              <TkLabel htmlFor="task-priority">{t('task.priority')}</TkLabel>
              <TkSelect
                value={form.priority}
                onValueChange={(value) => setForm({ ...form, priority: value as TaskPriority })}
              >
                <TkSelectTrigger id="task-priority" aria-label={t('task.priority')}>
                  <TkSelectValue />
                </TkSelectTrigger>
                <TkSelectContent>
                  <TkSelectItem value="low">{t('task.priorityLow')}</TkSelectItem>
                  <TkSelectItem value="medium">{t('task.priorityMedium')}</TkSelectItem>
                  <TkSelectItem value="high">{t('task.priorityHigh')}</TkSelectItem>
                </TkSelectContent>
              </TkSelect>
            </div>
          </div>

          <div className="space-y-2">
            <TkLabel htmlFor="task-due-date">{t('task.dueDate')}</TkLabel>
            <TkInput
              id="task-due-date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>

          <TkDialogFooter>
            <TkButton type="button" intent="secondary" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </TkButton>
            <TkButton type="submit" disabled={saving || !form.title.trim()}>
              {task ? t('common.update') : t('common.create')}
            </TkButton>
          </TkDialogFooter>
        </form>
      </TkDialogContent>
    </TkDialogRoot>
  );
}
