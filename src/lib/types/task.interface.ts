export enum TaskColumn {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
  UNDER_REVIEW = 'under-review',
  BACKLOG = 'backlog',

}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface Assignee {
  name?: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  column: TaskColumn;
  priority?: Priority;
  assignee?: Assignee;
  timeEstimate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
  position: number
}

export interface TaskStore {
  tasks: Task[];
  searchQuery: string;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newColumn: TaskColumn) => void;
  setSearchQuery: (query: string) => void;
  getFilteredTasks: () => Task[];
  getTasksByColumn: (column: TaskColumn) => Task[];
}