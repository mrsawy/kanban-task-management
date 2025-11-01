import React, { useState } from 'react';

import { Clock, Edit, Trash2 } from 'lucide-react';
import { Priority, Task, TaskColumn } from '@/lib/types/task.interface';
import { Draggable } from '@hello-pangea/dnd';
import { Avatar, Badge, Button, Card, CardContent, IconButton } from '@mui/material';
import { TaskDialog } from './task-dialog';
import useGeneralStore from '@/lib/store/general.store';
import { toast } from 'react-toastify';
import { useDeleteTask, useUpdateTask } from '@/lib/hooks/tasks.hook';
import useTaskStore from '@/lib/store/task.store';

interface TaskCardProps {
    task: Task;
    index: number;
}

const priorityConfig = {
    high: { color: 'bg-red-100 text-red-800 border-red-200', label: 'High' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Medium' },
    low: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low' }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
    const priorityStyle = priorityConfig[task?.priority ?? Priority.MEDIUM];
    const [editDialogOpen, setDialogOpen] = useState(false);
    const updateTask = useUpdateTask();
    const deleteTaskAction = useDeleteTask();

    const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
        useGeneralStore.setState({ generalIsLoading: true });
        try {
            updateTask.mutate({ id, updates });
            setDialogOpen(false);
        } catch (error: any) {
            console.error('Error updating task:', error);
            toast.error(error.message ? error.message : 'Something went wrong')
        } finally {
            useGeneralStore.setState({ generalIsLoading: false });
        }
    };

    const { deleteTask } = useTaskStore()
    const onDelete = async (id: string) => {
        deleteTask(id)
        await deleteTaskAction.mutateAsync(id)
        toast.success("Task Deleted Successfully !")
    }


    return (
        <>
            <Draggable draggableId={task.id} index={index} >
                {(provided, snapshot) => (
                    <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''} `}


                    >

                        <CardContent className="p-4 overview-hidden"
                            style={{
                                backgroundColor: task?.color
                                    ? `color-mix(in srgb, ${task.color} 5%, transparent)`
                                    : "rgba(255,255,255,0.2)"
                            }}>
                            {/* Priority Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <Badge
                                    className={`text-xs font-medium ${priorityStyle.color}`}
                                >
                                    {priorityStyle.label}
                                </Badge>

                                <div
                                    className="flex items-center space-x-1  "
                                >
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDialogOpen(true)
                                        }} color="primary"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </IconButton>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(task.id);
                                        }}
                                        color="primary"                                >
                                        <Trash2 className="h-3 w-3 p-0 m-0" />
                                    </IconButton>
                                </div>
                            </div>

                            {/* Task Title */}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {task.title}
                            </h3>

                            {/* Task Description */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {task.description}
                            </p>

                            {/* Bottom Section */}
                            <div className="flex items-center justify-between">
                                {/* Time Estimate */}
                                {task.timeEstimate && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{task.timeEstimate}</span>
                                    </div>
                                )}

                                {/* Assignee Avatar */}
                                {task.assignee && (
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-6 w-6" src={task.assignee.avatar} alt={task.assignee.name} />
                                        <span className="text-xs text-gray-600 hidden sm:inline">
                                            {task.assignee.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Due Date */}
                            {task.dueDate && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Draggable >
            <TaskDialog
                open={editDialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleUpdateTask}
                task={task}
                mode="edit"
            />
        </>
    );
};