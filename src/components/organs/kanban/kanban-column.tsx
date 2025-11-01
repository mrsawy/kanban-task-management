import React, { use, useEffect, useRef } from 'react';

import { TaskCard } from './task-card';
import { Task, TaskColumn } from '@/lib/types/task.interface';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Badge, Card, CardContent, CardHeader, Button } from '@mui/material';
import { useInfiniteTasksByColumn, useReorderTasks } from '@/lib/hooks/tasks.hook';
import useTaskStore, { selectFilteredTasksByColumn, selectTasksByColumn } from '@/lib/store/task.store';



interface KanbanColumnProps {
    column: {
        id: TaskColumn;
        title: string;
        color: string;
    };
}

export const KanbanColumn = React.memo(function KanbanColumn({
    column
}: KanbanColumnProps) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteTasksByColumn(column.id);

    const observerTarget = useRef<HTMLDivElement>(null);
    const searchQuery = useTaskStore(state => state.searchQuery);
    // Get tasks from Zustand store for instant updates
    const localTasks = selectFilteredTasksByColumn(column.id, searchQuery)(useTaskStore());

    useEffect(() => {
        if (data?.pages) {
            // Fix: Use correct property based on your API response
            const serverTasks = data.pages.flatMap(page => page.data || []);

            // Use getState() to avoid adding to dependencies
            const store = useTaskStore.getState();
            const currentTasks = store.tasks;
            const otherColumnTasks = currentTasks.filter(t => t.column !== column.id);

            // Create merged task list
            const mergedTasks = [...otherColumnTasks, ...serverTasks];

            // Only update if the data actually changed (prevents infinite loop)
            const currentColumnTasks = currentTasks.filter(t => t.column === column.id);
            const tasksChanged = JSON.stringify(currentColumnTasks) !== JSON.stringify(serverTasks);

            if (tasksChanged) {
                store.setTasks(mergedTasks);
            }
        }
    }, [data, column.id]);

    // Optional: Auto-load more when scrolling (infinite scroll)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Use local tasks for instant UI updates
    const displayTasks = searchQuery
        ? localTasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : localTasks;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 p-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-gray-50 border-gray-200 h-fit min-h-[600px]">
            <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center space-x-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                    />
                    <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                        {column.title}
                    </h2>
                </div>
                <Badge className="bg-white text-gray-600 border-gray-300">
                    {displayTasks.length} Lead{displayTasks.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            <CardContent className="pt-0">
                <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[500px] transition-colors duration-200 rounded-lg p-2 ${snapshot.isDraggingOver
                                ? 'bg-blue-50 border-2 border-blue-200 border-dashed'
                                : ''
                                }`}
                        >
                            {displayTasks.map((task, index) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={index}
                                />
                            ))}
                            {provided.placeholder}

                            {displayTasks.length === 0 && (
                                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                                    Drop tasks here
                                </div>
                            )}

                            {/* Infinite scroll trigger */}
                            <div ref={observerTarget} className="h-4" />

                            {/* Load More Button */}
                            {hasNextPage && (
                                <div className="flex justify-center py-4">
                                    <Button
                                        variant="outlined"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="w-full"
                                    >
                                        {isFetchingNextPage ? 'Loading...' : 'Load More'}
                                    </Button>
                                </div>
                            )}

                            {!hasNextPage && displayTasks.length > 0 && (
                                <div className="text-center text-sm text-gray-400 py-4">
                                    No more tasks
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </CardContent>
        </Card>
    );
});