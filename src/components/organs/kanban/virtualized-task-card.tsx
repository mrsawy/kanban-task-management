import React from 'react';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { FixedSizeList as List, ListChildComponentData } from 'react-window';
import { Task } from '@/lib/types/task.interface';
import { TaskCard } from './task-card';


interface VirtualTaskColumnProps {
    columnId: string;
    tasks: Task[];
    title: string;
}

export const VirtualTaskColumn: React.FC<VirtualTaskColumnProps> = ({
    columnId,
    tasks,
    title
}) => {
    // Row renderer for react-window
    const Row = ({ data, index, style }: ListChildComponentProps<Task[]>) => {
        const task = data[index];

        // Rendering placeholder space (non-draggable item)
        if (!task) {
            return <div style={style} />;
        }

        return (
            <div style={style}>
                <TaskCard task={task} index={index} />
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Column Header */}
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">{title}</h2>
                <span className="text-sm text-gray-500">{tasks.length} tasks</span>
            </div>

            {/* Droppable Area with Virtual List */}
            <Droppable
                droppableId={columnId}
                mode="virtual"
                renderClone={(provided, snapshot, rubric) => (
                    <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className="p-2"
                    >
                        <TaskCard task={tasks[rubric.source.index]} index={rubric.source.index} />
                    </div>
                )}
            >
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                    // Add extra item for placeholder when dragging
                    const itemCount = snapshot.isUsingPlaceholder
                        ? tasks.length + 1
                        : tasks.length;

                    return (
                        <List
                            height={600} // Adjust based on your layout
                            itemCount={itemCount}
                            itemSize={200} // Adjust based on your TaskCard height
                            width="100%"
                            outerRef={provided.innerRef}
                            itemData={tasks}
                            overscanCount={2} // CRITICAL: Enable overscanning!
                            className="scrollbar-thin"
                        >
                            {Row}
                        </List>
                    );
                }}
            </Droppable>
        </div>
    );
};