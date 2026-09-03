import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../HomePage';
import api from '@/lib/axios';
import { useTasksStore } from '@/stores/useTasksStore';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const task = {
  id: 1,
  title: 'Complete project',
  description: 'Finish the project documentation',
  status: 'in_progress' as const,
  priority: 'high' as const,
  due_date: '2024-12-31T17:00:00',
  created_at: '2024-01-01T09:00:00',
  updated_at: '2024-01-01T09:00:00',
};

beforeEach(() => {
  vi.clearAllMocks();
  useTasksStore.setState({ tasks: [], loading: false, error: null });
});

describe('HomePage', () => {
  it('renders the page heading and the create button', async () => {
    mockedApi.get.mockResolvedValue({ data: [] });

    render(<HomePage />);

    expect(await screen.findByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('fetches tasks on mount and renders one card per task', async () => {
    mockedApi.get.mockResolvedValue({
      data: [task, { ...task, id: 2, title: 'Review code', status: 'todo', priority: 'medium' }],
    });

    render(<HomePage />);

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/tasks'));
    expect(await screen.findAllByTestId('task-card')).toHaveLength(2);
    expect(screen.getByText('Complete project')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows the empty state when there are no tasks', async () => {
    mockedApi.get.mockResolvedValue({ data: [] });

    render(<HomePage />);

    expect(await screen.findByText('No tasks found')).toBeInTheDocument();
  });

  it('opens the create dialog with an empty form', async () => {
    const user = userEvent.setup();
    mockedApi.get.mockResolvedValue({ data: [] });

    render(<HomePage />);
    await screen.findByText('No tasks found');

    await user.click(screen.getByRole('button', { name: /create task/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Create Task');
    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  it('creates a task and reloads the list', async () => {
    const user = userEvent.setup();
    mockedApi.get.mockResolvedValue({ data: [] });
    mockedApi.post.mockResolvedValue({ data: { ...task, id: 3, title: 'New Task' } });

    render(<HomePage />);
    await screen.findByText('No tasks found');

    await user.click(screen.getByRole('button', { name: /create task/i }));
    await user.type(await screen.findByLabelText('Title'), 'New Task');
    await user.type(screen.getByLabelText('Description'), 'A new task');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith('/tasks', {
        title: 'New Task',
        description: 'A new task',
        status: 'todo',
        priority: 'medium',
      }),
    );
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(2));
  });

  it('opens the edit dialog prefilled and updates the task', async () => {
    const user = userEvent.setup();
    mockedApi.get.mockResolvedValue({ data: [task] });
    mockedApi.put.mockResolvedValue({ data: { ...task, title: 'Updated Task' } });

    render(<HomePage />);
    await screen.findByTestId('task-card');

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const titleInput = await screen.findByLabelText('Title');
    expect(titleInput).toHaveValue('Complete project');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(mockedApi.put).toHaveBeenCalledWith('/tasks/1', {
        title: 'Updated Task',
        description: 'Finish the project documentation',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date('2024-12-31').toISOString(),
      }),
    );
  });

  it('deletes a task once the confirmation is accepted', async () => {
    const user = userEvent.setup();
    mockedApi.get.mockResolvedValue({ data: [task] });
    mockedApi.delete.mockResolvedValue({ data: {} });

    render(<HomePage />);
    await screen.findByTestId('task-card');

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Delete task');

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockedApi.delete).toHaveBeenCalledWith('/tasks/1'));
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(2));
  });

  it('still renders when the task request fails', async () => {
    mockedApi.get.mockRejectedValue(new Error('API Error'));

    render(<HomePage />);

    expect(await screen.findByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    await waitFor(() => expect(useTasksStore.getState().error).toBe('API Error'));
  });
});
