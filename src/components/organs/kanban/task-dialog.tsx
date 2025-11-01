import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    Select,
    FormControl,
    FormLabel,
    FormHelperText,
    Box,
    Stack,
    Chip,
    Typography,
} from '@mui/material';
import { Task, TaskColumn, Priority } from '@/lib/types/task.interface';
import { taskSchema, TaskFormData } from '@/lib/schema/task.schema';
import useGeneralStore from '@/lib/store/general.store';
import { COLORS, COLUMNS, PRIORITIES } from '@/lib/constants/task';

interface BaseTaskDialogProps {
    open: boolean;
    onClose: () => void;
}

interface CreateTaskDialogProps extends BaseTaskDialogProps {
    mode: 'create';
    task?: null;
    onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => Promise<void>;
}

interface EditTaskDialogProps extends BaseTaskDialogProps {
    mode: 'edit';
    task: Task;
    onSubmit: (id: string, updates: Partial<Task>) => Promise<void>;
}

type TaskDialogProps = CreateTaskDialogProps | EditTaskDialogProps;


export const TaskDialog: React.FC<TaskDialogProps> = (props) => {
    const { open, onClose, mode } = props;
    const { generalIsLoading: isLoading } = useGeneralStore();
    const isEditing = (mode === 'edit') && !!props.task;
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: isEditing ? props.task.title : '',
            description: isEditing ? props.task.description || '' : "",
            column: isEditing ? props.task.column : TaskColumn.BACKLOG,
            color: isEditing ? props.task.color || 'blue' : 'blue',
            priority: isEditing ? props.task?.priority || Priority.MEDIUM : Priority.MEDIUM,
            timeEstimate: isEditing ? props.task.timeEstimate || '' : "",
            dueDate: isEditing ? props.task.dueDate || '' : "",
            assignee: isEditing ? props.task.assignee || {
                name: '',
                avatar: '',
            } : {
                name: '',
                avatar: '',
            },
        },
    });
    useEffect(() => {
        if (mode === "edit" && props.task) {
            reset({
                title: props.task.title,
                description: props.task.description || "",
                column: props.task.column,
                color: props.task.color || "blue",
                priority: props.task.priority || Priority.MEDIUM,
                timeEstimate: props.task.timeEstimate || "",
                dueDate: props.task.dueDate || "",
                assignee: props.task.assignee || { name: "", avatar: "" },
            });
        } else {
            reset({
                title: "",
                description: "",
                column: TaskColumn.BACKLOG,
                color: "blue",
                priority: Priority.MEDIUM,
                timeEstimate: "",
                dueDate: "",
                assignee: { name: "", avatar: "" },
            });
        }
    }, [mode, props.task, reset]);


    const onFormSubmit = async (data: TaskFormData) => {
        const taskData = {
            ...data,
            assignee: data.assignee?.name ? data.assignee : undefined,
            timeEstimate: data.timeEstimate || undefined,
            dueDate: data.dueDate || undefined,
        };

        if (mode === "create") {
            await props.onSubmit(taskData);
            reset();
        } else {
            await props.onSubmit(props.task.id, taskData);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogContent sx={{ p: 4 }}>
                <DialogTitle sx={{ p: 0, mb: 3, fontSize: '1.5rem', fontWeight: 600 }}>
                    {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>

                <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
                    <Stack spacing={3}>
                        {/* Title */}
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.title}>
                                    <FormLabel required sx={{ mb: 1, fontWeight: 500 }}>
                                        Title
                                    </FormLabel>
                                    <TextField
                                        {...field}
                                        placeholder="Enter task title"
                                        error={!!errors.title}
                                        helperText={errors.title?.message}
                                        fullWidth
                                        size="small"
                                    />
                                </FormControl>
                            )}
                        />

                        {/* Description */}
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Description</FormLabel>
                                    <TextField
                                        {...field}
                                        placeholder="Enter task description"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        size="small"
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                </FormControl>
                            )}
                        />

                        {/* Column & Priority */}
                        <Stack direction="row" spacing={2}>
                            <Controller
                                name="column"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.column}>
                                        <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Column</FormLabel>
                                        <Select {...field} size="small">
                                            {COLUMNS.map((column) => (
                                                <MenuItem key={column.id} value={column.id}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: column.color,
                                                            }}
                                                        />
                                                        <Typography>{column.title}</Typography>
                                                    </Stack>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.column && (
                                            <FormHelperText>{errors.column.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.priority}>
                                        <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Priority</FormLabel>
                                        <Select {...field} size="small">
                                            {PRIORITIES.map((priority) => (
                                                <MenuItem key={priority.id} value={priority.id}>
                                                    <Chip
                                                        label={priority.title}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: priority.color + '20',
                                                            color: priority.color,
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.priority && (
                                            <FormHelperText>{errors.priority.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Stack>

                        {/* Color Selection */}
                        <Controller
                            name="color"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Color Tag</FormLabel>
                                    <Stack direction="row" spacing={1}>
                                        {COLORS.map((color) => (
                                            <Box
                                                key={color.id}
                                                onClick={() => field.onChange(color.id)}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '8px',
                                                    bgcolor: `color-mix(in srgb, ${color.value} 30%, transparent)`,
                                                    cursor: 'pointer',
                                                    border:
                                                        field.value === color.id
                                                            ? '3px solid #000'
                                                            : '2px solid transparent',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </FormControl>
                            )}
                        />

                        {/* Time Estimate & Due Date */}
                        <Stack direction="row" spacing={2}>
                            <Controller
                                name="timeEstimate"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <FormLabel sx={{ mb: 1, fontWeight: 500 }}>
                                            Time Estimate
                                        </FormLabel>
                                        <TextField
                                            {...field}
                                            placeholder="e.g., 2 hours"
                                            size="small"
                                            fullWidth
                                        />
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="dueDate"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Due Date</FormLabel>
                                        <TextField
                                            {...field}
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </Stack>

                        {/* Assignee */}
                        <Controller
                            name="assignee.name"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Assignee</FormLabel>
                                    <TextField
                                        {...field}
                                        placeholder="Enter assignee name"
                                        size="small"
                                        fullWidth
                                    />
                                </FormControl>
                            )}
                        />

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                                type="button"
                                onClick={handleClose}
                                variant="outlined"
                                fullWidth
                                sx={{ textTransform: 'none', fontWeight: 500 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={isLoading}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    bgcolor: '#18181b',
                                    '&:hover': { bgcolor: '#27272a' },
                                }}
                            >
                                {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Task' : 'Create Task'}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
};