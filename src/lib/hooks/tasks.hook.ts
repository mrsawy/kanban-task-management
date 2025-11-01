// hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Task, TaskColumn } from '../types/task.interface';
import { taskApi } from '../api/task.api';

import { useEffect } from 'react';
import useTaskStore from '../store/task.store';

export const TASK_QUERY_KEY = ['tasks'];

export const useTasks = () => {
    const query = useQuery({
        queryKey: TASK_QUERY_KEY,
        queryFn: taskApi.getTasks,
    });

    // Sync server data to Zustand store
    useEffect(() => {
        if (query.data) {
            // Use getState() to avoid subscribing and causing re-renders
            const store = useTaskStore.getState();

            // Only update if data actually changed
            const currentTasks = store.tasks;
            const dataChanged = JSON.stringify(currentTasks) !== JSON.stringify(query.data);

            if (dataChanged) {
                store.setTasks(query.data);
            }
        }
    }, [query.data]); // Remove setTasks from dependencies

    return query;
};

// Infinite scroll hook for a specific column
export const useInfiniteTasksByColumn = (column: TaskColumn, limit?: number) => {
    return useInfiniteQuery({
        queryKey: ['tasks', 'infinite', column],
        queryFn: ({ pageParam = 1 }) =>
            taskApi.getTasksByColumnPaginated(column, pageParam, limit),
        getNextPageParam: (lastPage) => {
            return lastPage?.next ? lastPage.next : undefined;
        },
        initialPageParam: 1,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const addTask = useTaskStore(state => state.addTask);

    return useMutation({
        mutationFn: async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
            // Get existing tasks in the same column from the server
            const tasksInColumn = await taskApi.getTasksByColumn(newTask.column);

            // Calculate position to place new task at the top
            let newPosition: number;
            if (tasksInColumn.length === 0) {
                // No tasks in column, use default position
                newPosition = 1000;
            } else {
                // Get the first (top) task's position and place new task before it
                const firstTaskPosition = tasksInColumn[0].position || 0;
                newPosition = firstTaskPosition / 2;
            }

            // Create task with calculated position
            return taskApi.createTask({ ...newTask, position: newPosition });
        },
        onMutate: async (newTask) => {
            // Get existing tasks in the same column
            const tasks = useTaskStore.getState().tasks;
            const tasksInColumn = tasks
                .filter(t => t.column === newTask.column)
                .sort((a, b) => (a.position || 0) - (b.position || 0));

            // Calculate position to place new task at the top
            let newPosition: number;
            if (tasksInColumn.length === 0) {
                // No tasks in column, use default position
                newPosition = 1000;
            } else {
                // Get the first (top) task's position and place new task before it
                const firstTaskPosition = tasksInColumn[0].position || 0;
                newPosition = firstTaskPosition / 2;
            }

            // Optimistic update to Zustand store
            const tempId = `temp-${Date.now()}`;
            const optimisticTask: Task = {
                ...newTask,
                id: tempId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                position: newPosition,
            } as Task;

            addTask(optimisticTask);
            return { tempId };
        },
        onSuccess: (data, variables, context) => {
            // Replace temp task with real task from server
            const deleteTask = useTaskStore.getState().deleteTask;
            const addTask = useTaskStore.getState().addTask;

            if (context?.tempId) {
                deleteTask(context.tempId);
            }
            addTask(data);

            queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'infinite'] });
        },
        onError: (error, variables, context) => {
            // Rollback optimistic update
            if (context?.tempId) {
                useTaskStore.getState().deleteTask(context.tempId);
            }
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const updateTaskStore = useTaskStore(state => state.updateTask);

    return useMutation({
        mutationFn: (data: { id: string; updates: Partial<Task> }) =>
            taskApi.updateTask(data.id, data.updates),
        onMutate: async (data) => {
            // Optimistic update to Zustand store
            updateTaskStore(data.id, data.updates);

            const previousTasks = useTaskStore.getState().tasks;
            return { previousTasks };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                useTaskStore.getState().setTasks(context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'infinite'] });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    const deleteTaskStore = useTaskStore(state => state.deleteTask);

    return useMutation({
        mutationFn: taskApi.deleteTask,
        onMutate: async (id) => {
            // Optimistic update to Zustand store
            const previousTasks = useTaskStore.getState().tasks;
            deleteTaskStore(id);
            return { previousTasks };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                useTaskStore.getState().setTasks(context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'infinite'] });
        },
    });
};

export const useMoveTask = () => {
    const queryClient = useQueryClient();
    const moveTaskStore = useTaskStore(state => state.moveTask);

    return useMutation({
        mutationFn: ({ taskId, newColumn, dropIndex }: {
            taskId: string;
            newColumn: TaskColumn;
            dropIndex: number;
        }) => taskApi.moveTask(taskId, newColumn, dropIndex),
        onMutate: async ({ taskId, newColumn, dropIndex }) => {
            const previousTasks = useTaskStore.getState().tasks;
            const tasks = previousTasks;

            const task = tasks.find(t => t.id === taskId);
            if (!task) return { previousTasks };

            // Calculate new position
            const destColumnTasks = tasks
                .filter(t => t.column === newColumn && t.id !== taskId)
                .sort((a, b) => (a.position || 0) - (b.position || 0));

            let newPosition: number;

            if (destColumnTasks.length === 0) {
                newPosition = 0;
            } else if (dropIndex === 0) {
                newPosition = (destColumnTasks[0].position || 0) / 2;
            } else if (dropIndex >= destColumnTasks.length) {
                newPosition = (destColumnTasks[destColumnTasks.length - 1].position || 0) + 1000;
            } else {
                const prevTask = destColumnTasks[dropIndex - 1];
                const nextTask = destColumnTasks[dropIndex];
                newPosition = ((prevTask.position || 0) + (nextTask.position || 0)) / 2;
            }

            // Optimistic update to Zustand store
            moveTaskStore(taskId, newColumn, newPosition);

            return { previousTasks };
        },
        onError: (error, variables, context) => {
            if (context?.previousTasks) {
                useTaskStore.getState().setTasks(context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'infinite'] });
        },
    });
};

export const useReorderTasks = () => {
    const queryClient = useQueryClient();
    const reorderTaskStore = useTaskStore(state => state.reorderTask);

    return useMutation({
        mutationFn: ({
            taskId,
            dropIndex,
            column
        }: {
            taskId: string;
            dropIndex: number;
            column: TaskColumn
        }) => taskApi.reorderTasks(taskId, dropIndex, column),
        onMutate: async ({ taskId, dropIndex, column }) => {
            const previousTasks = useTaskStore.getState().tasks;
            const tasks = previousTasks;

            const task = tasks.find(t => t.id === taskId);
            if (!task) return { previousTasks };

            // Calculate new position
            const tasksInColumn = tasks
                .filter(t => t.column === column && t.id !== taskId)
                .sort((a, b) => (a.position || 0) - (b.position || 0));

            let newPosition: number;

            if (tasksInColumn.length === 0) {
                newPosition = 0;
            } else if (dropIndex === 0) {
                newPosition = (tasksInColumn[0].position || 0) / 2;
            } else if (dropIndex >= tasksInColumn.length) {
                newPosition = (tasksInColumn[tasksInColumn.length - 1].position || 0) + 1000;
            } else {
                const prevTask = tasksInColumn[dropIndex - 1];
                const nextTask = tasksInColumn[dropIndex];
                newPosition = ((prevTask.position || 0) + (nextTask.position || 0)) / 2;
            }

            // Optimistic update to Zustand store
            reorderTaskStore(taskId, column, newPosition);

            return { previousTasks };
        },
        onError: (error, variables, context) => {
            if (context?.previousTasks) {
                useTaskStore.getState().setTasks(context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'infinite'] });
        },
    });
};