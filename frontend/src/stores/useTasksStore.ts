import { create } from 'zustand';
import api from '@/lib/axios';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  createTask: (task: TaskInput) => Promise<Task>;
  updateTask: (id: number, task: TaskInput) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<Task[]>('/tasks');
      set({ tasks: response.data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch tasks',
        loading: false,
      });
      throw err;
    }
  },

  createTask: async (task) => {
    const response = await api.post<Task>('/tasks', task);
    await get().fetchTasks();
    return response.data;
  },

  updateTask: async (id, task) => {
    const response = await api.put<Task>(`/tasks/${id}`, task);
    await get().fetchTasks();
    return response.data;
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    await get().fetchTasks();
  },
}));
