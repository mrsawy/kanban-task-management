import { z } from 'zod';
import { TaskColumn, Priority } from '../types/task.interface';

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(1, 'description is required').max(200, 'description must be less than 200 characters'),
    column: z.enum(Object.values(TaskColumn)),
    color: z.string().optional(),
    priority: z.enum(Object.values(Priority)).optional(),
    timeEstimate: z.string().optional(),
    dueDate: z.string().optional(),
    assignee: z.object({
        name: z.string().optional(),
        avatar: z.string().optional(),
    }).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;