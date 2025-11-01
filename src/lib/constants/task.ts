import { TaskColumn } from "../types/task.interface";

export const COLUMNS = [
    { id: TaskColumn.BACKLOG, title: 'Backlog', color: '#6B7280' },
    { id: TaskColumn.IN_PROGRESS, title: 'In Progress', color: '#F59E0B' },
    { id: TaskColumn.UNDER_REVIEW, title: 'Under Review', color: '#8B5CF6' },
    { id: TaskColumn.COMPLETED, title: 'Completed', color: '#10B981' },
];

export const PRIORITIES = [
    { id: 'low', title: 'Low', color: '#10B981' },
    { id: 'medium', title: 'Medium', color: '#F59E0B' },
    { id: 'high', title: 'High', color: '#EF4444' },
];

export const COLORS = [
    { id: 'red', value: '#EF4444' },
    { id: 'orange', value: '#F97316' },
    { id: 'yellow', value: '#EAB308' },
    { id: 'green', value: '#22C55E' },
    { id: 'blue', value: '#3B82F6' },
    { id: 'purple', value: '#A855F7' },
    { id: 'pink', value: '#EC4899' },
];
