import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { TkButton } from 'thinkube-style/components/buttons-badges';
import { TkPageWrapper } from 'thinkube-style/components/utilities';
import { TkInfoAlert } from 'thinkube-style/components/feedback';
import { TkControlledConfirmDialog } from 'thinkube-style/components/modals-overlays';
import { TaskCard } from '@/components/TaskCard';
import { TaskDialog } from '@/components/TaskDialog';
import { useTasksStore, type Task, type TaskInput } from '@/stores/useTasksStore';

export default function HomePage() {
  const { t } = useTranslation();
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTasksStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks().catch(() => toast.error(t('home.loadFailed')));
  }, [fetchTasks, t]);

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: TaskInput) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, input);
        toast.success(t('task.updated'));
      } else {
        await createTask(input);
        toast.success(t('task.created'));
      }
      setDialogOpen(false);
      setEditingTask(null);
    } catch {
      toast.error(t('task.saveFailed'));
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      toast.success(t('task.deleted'));
    } catch {
      toast.error(t('task.deleteFailed'));
    } finally {
      setTaskToDelete(null);
    }
  };

  return (
    <TkPageWrapper>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('home.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('home.subtitle')}</p>
        </div>
        <TkButton onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('home.createTask')}
        </TkButton>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <TkInfoAlert>{t('home.noTasks')}</TkInfoAlert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={setTaskToDelete} />
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        task={editingTask}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />

      <TkControlledConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title={t('home.confirmDeleteTitle')}
        description={t('home.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </TkPageWrapper>
  );
}
