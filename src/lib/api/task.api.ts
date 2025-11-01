// api/task.ts
import { JSON_SERVER_URL } from "../constants";
import { Paginated } from "../types/paginated.interface";
import { Task, TaskColumn } from "../types/task.interface";
import { COLUMNS } from '@/lib/constants/task';

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const promises: Promise<Task[]>[] = COLUMNS.map(c =>
      fetch(`${JSON_SERVER_URL}/tasks?column=${c.id}&_sort=position&_order=asc`).then(res => res.json())
    );

    const results = await Promise.all(promises);
    const tasks: Task[] = results.flat();
    console.log({ tasks })
    return tasks;
  },

  // Paginated tasks for infinite scroll
  getTasksByColumnPaginated: async (
    column: TaskColumn,
    page: number = 1,
    limit: number = 5
  ): Promise<Paginated<Task>> => {
    const response = await fetch(
      `${JSON_SERVER_URL}/tasks?column=${column}&_page=${page}&_per_page=${limit}&_sort=position&_order=asc`
    );

    const result = await response.json() as Paginated<Task>

    return result
  },

  getTasksByColumn: async (column: TaskColumn): Promise<Task[]> => {
    const response = await fetch(
      `${JSON_SERVER_URL}/tasks?column=${column}&_sort=position&_order=asc`
    );
    const data = await response.json();
    return data;
  },


  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { position?: number }): Promise<Task> => {
    const taskWithPosition = {
      ...task,
      position: task.position ?? 0, // Use provided position or default to 0
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await fetch(`${JSON_SERVER_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskWithPosition),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log({ data, task: taskWithPosition });
    return data;
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const response = await fetch(`${JSON_SERVER_URL}/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updatesWithTimestamp),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log({ data, updates: updatesWithTimestamp });
    return data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await fetch(`${JSON_SERVER_URL}/tasks/${id}`, {
      method: "DELETE"
    });
  },

  moveTask: async (
    taskId: string,
    newColumn: TaskColumn,
    dropIndex: number
  ): Promise<void> => {
    // Get all tasks in the destination column, sorted by position
    const destTasks = (await taskApi.getTasksByColumn(newColumn))
      .filter(t => t.id !== taskId) // Exclude the task being moved
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    let newPosition: number;

    if (destTasks.length === 0) {
      // First task in the column
      newPosition = 0;
    } else if (dropIndex === 0) {
      // Dropped at the beginning
      // Position = (first task position / 2) to place it before
      newPosition = (destTasks[0].position || 0) / 2;
    } else if (dropIndex >= destTasks.length) {
      // Dropped at the end
      // Position = last task position + 1000
      newPosition = (destTasks[destTasks.length - 1].position || 0) + 1000;
    } else {
      // Dropped between two tasks
      // Position = average of previous and next task positions
      const prevTask = destTasks[dropIndex - 1];
      const nextTask = destTasks[dropIndex];
      newPosition = ((prevTask.position || 0) + (nextTask.position || 0)) / 2;
    }

    // Update the moved task with new column and calculated position
    await taskApi.updateTask(taskId, {
      column: newColumn,
      position: newPosition
    });
  },

  // Reorder tasks within a column using position-based calculation
  reorderTasks: async (
    taskId: string,
    dropIndex: number,
    column: TaskColumn
  ): Promise<void> => {
    const tasksInColumn = (await taskApi.getTasksByColumn(column))
      .filter(t => t.id !== taskId) // Exclude the task being moved
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    let newPosition: number;

    if (tasksInColumn.length === 0) {
      // Only task in the column
      newPosition = 0;
    } else if (dropIndex === 0) {
      // Moved to the beginning
      newPosition = (tasksInColumn[0].position || 0) / 2;
    } else if (dropIndex >= tasksInColumn.length) {
      // Moved to the end
      newPosition = (tasksInColumn[tasksInColumn.length - 1].position || 0) + 1000;
    } else {
      // Moved between two tasks - calculate midpoint
      const prevTask = tasksInColumn[dropIndex - 1];
      const nextTask = tasksInColumn[dropIndex];
      newPosition = ((prevTask.position || 0) + (nextTask.position || 0)) / 2;
    }

    // Update only the moved task
    await taskApi.updateTask(taskId, { position: newPosition });
  },

  // Bulk update task positions (for drag & drop)
  bulkUpdatePositions: async (updates: { id: string; position: number }[]): Promise<void> => {
    await Promise.all(
      updates.map(update =>
        taskApi.updateTask(update.id, { position: update.position })
      )
    );
  },
};