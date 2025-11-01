"use client"
import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

import { Header } from './header';
import { Task, TaskColumn } from '@/lib/types/task.interface';
import { KanbanColumn } from './kanban-column';
import { TaskDialog } from './task-dialog';
import { useCreateTask, useDeleteTask, useMoveTask, useReorderTasks, useTasks, useUpdateTask } from '@/lib/hooks/tasks.hook';
import { COLUMNS } from '@/lib/constants/task';
import useTaskStore from '@/lib/store/task.store';


export const KanbanBoard: React.FC = () => {
    const moveTask = useMoveTask();
    const reorderTasks = useReorderTasks();
    const { isLoading } = useTasks();
    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        // No movement
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const sourceColumn = source.droppableId as TaskColumn;
        const destColumn = destination.droppableId as TaskColumn;

        // Moving between columns
        if (sourceColumn !== destColumn) {
            await moveTask.mutateAsync({
                taskId: draggableId,
                newColumn: destColumn,
                dropIndex: destination.index,
            });
        } else {
            // Reordering within the same column
            await reorderTasks.mutateAsync({
                taskId: draggableId,
                dropIndex: destination.index,
                column: sourceColumn,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {COLUMNS.map((column) => (
                            <div key={column.id} className="animate-pulse">
                                <div className="h-[600px] bg-gray-200 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Header />
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {COLUMNS.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
};