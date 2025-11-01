import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Button, Input, InputAdornment, TextField } from '@mui/material';
import useTaskStore from '@/lib/store/task.store';
import { useCreateTask } from '@/lib/hooks/tasks.hook';
import useGeneralStore from '@/lib/store/general.store';
import { toast } from 'react-toastify';
import { TaskDialog } from './task-dialog';
import { Task } from '@/lib/types/task.interface';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';


export const Header: React.FC = () => {

  const { searchQuery, setSearchQuery } = useTaskStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const CreateTask = useCreateTask()
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true });
      const res = await CreateTask.mutateAsync(taskData);
      console.log({ res })
      handleCloseDialog();
      toast.success("Task Created Successfully !")
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message ? error.message : 'Something went wrong')
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  }

  return (<>
    <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-lg shadow-sm border flex-wrap sm:flex-nowrap max-[600px]:space-y-3">
      <div className="flex items-center space-x-6 w-full flex-wrap gap-3 sm:flex-nowrap">
        <h1 className="text-2xl font-bold text-gray-900 text-nowrap">Kanban Board</h1>

        <div className="relative w-full">
          <TextField
            placeholder="Search By Title Or Description..."

            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ paddingRight: "5px" }} />,
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center  space-x-3 gap-2 ml-4">


        <Button
          variant="contained"
          endIcon={<AddCircleIcon />}
          onClick={handleOpenDialog}
          className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800  text-nowrap now"
          sx={{ paddingY: 2 }}
        >
          <span>Add New Task</span>
        </Button>
      </div>
    </div>
    <TaskDialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      onSubmit={handleCreateTask}
      mode='create'
    />
  </>
  );
};