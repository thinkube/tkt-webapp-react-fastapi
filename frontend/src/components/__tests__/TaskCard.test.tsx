import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../TaskCard';
import type { Task } from '@/stores/useTasksStore';

const task: Task = {
  id: 7,
  title: 'Write the docs',
  description: 'Cover the deployment steps',
  status: 'todo',
  priority: 'low',
  due_date: null,
  created_at: '2024-05-04T10:00:00',
  updated_at: '2024-05-04T10:00:00',
};

describe('TaskCard', () => {
  it('renders the task with its status and priority', () => {
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Write the docs')).toBeInTheDocument();
    expect(screen.getByText('Cover the deployment steps')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('omits the due date when the task has none', () => {
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByText(/^Due:/)).not.toBeInTheDocument();
  });

  it('shows the due date when the task has one', () => {
    render(
      <TaskCard
        task={{ ...task, due_date: '2024-12-31T17:00:00' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/^Due:/)).toBeInTheDocument();
  });

  it('reports edit and delete with the task', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(task);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});
