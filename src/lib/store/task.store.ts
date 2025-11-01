import { create } from "zustand";
import { Task, TaskColumn } from "../types/task.interface";

interface TaskStore {
    tasks: Task[];
    searchQuery: string;
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    moveTask: (taskId: string, newColumn: TaskColumn, newPosition: number) => void;
    reorderTask: (taskId: string, column: TaskColumn, newPosition: number) => void;
    setSearchQuery: (query: string) => void;
}

const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: [],
    searchQuery: '',
    
    setTasks: (tasks) => set({ tasks }),
    
    addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
    })),
    
    updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
        )
    })),
    
    deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
    })),
    
    moveTask: (taskId, newColumn, newPosition) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === taskId
                ? { ...task, column: newColumn, position: newPosition }
                : task
        )
    })),
    
    reorderTask: (taskId, column, newPosition) => set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === taskId
                ? { ...task, position: newPosition }
                : task
        )
    })),
    
    setSearchQuery: (query) => set({ searchQuery: query }),
}));

// Export selectors as separate functions (avoids re-render issues)
export const selectTasksByColumn = (column: TaskColumn) => (state: TaskStore) => {
    return state.tasks
        .filter(task => task.column === column)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
};

export const selectFilteredTasksByColumn = (column: TaskColumn, searchQuery: string) => (state: TaskStore) => {
    let filtered = state.tasks.filter(task => task.column === column);
    
    if (searchQuery) {
        filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return filtered.sort((a, b) => (a.position || 0) - (b.position || 0));
};

export default useTaskStore;