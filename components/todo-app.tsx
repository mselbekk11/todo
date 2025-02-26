'use client';

import { useState, useEffect } from 'react';
import {
  Inbox,
  Plus,
  Trash2,
  Layout,
  MoreHorizontal,
  GripVertical,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddTaskForm from './add-task-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import EditTaskForm from './edit-task-form';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  projectId?: string;
}

interface Project {
  id: string;
  name: string;
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Load data from localStorage only once on client side
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedProjects = localStorage.getItem('projects');

    // Set tasks from localStorage or use default tasks if none exist
    setTasks(
      savedTasks
        ? JSON.parse(savedTasks)
        : [
            {
              id: '1',
              title: 'hello',
              completed: false,
            },
            {
              id: '2',
              title: 'does this work',
              completed: false,
            },
            {
              id: '3',
              title: 'Test',
              completed: false,
            },
            {
              id: '4',
              title: 'bppm',
              completed: false,
            },
            {
              id: '5',
              title: 'l32nf',
              completed: false,
            },
            {
              id: '6',
              title: 'lk2rng',
              completed: false,
            },
          ]
    );

    // Set projects from localStorage or empty array if none exist
    setProjects(savedProjects ? JSON.parse(savedProjects) : []);
    setIsLoaded(true);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, isLoaded]);

  const filteredTasks = tasks.filter((task) =>
    selectedProjectId ? task.projectId === selectedProjectId : !task.projectId
  );

  const addTask = (task: Omit<Task, 'id' | 'completed' | 'projectId'>) => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(7),
      completed: false,
      projectId: selectedProjectId || undefined,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setShowAddTaskModal(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;

    const newProject = {
      id: Math.random().toString(36).substring(7),
      name: newProjectName.trim(),
    };

    setProjects((prev) => [...prev, newProject]);
    setNewProjectName('');
    setShowProjectModal(false);
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Also remove all tasks associated with this project
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  const editProject = (projectId: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, name: newName } : p))
    );
    setEditingProjectId(null);
    setNewProjectName('');
  };

  const getCurrentViewTitle = () => {
    if (!selectedProjectId) return 'Inbox';
    const project = projects.find((p) => p.id === selectedProjectId);
    return project?.name || 'Inbox';
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Get the tasks for the current view (either project tasks or inbox tasks)
    const currentTasks = items.filter((task) =>
      selectedProjectId ? task.projectId === selectedProjectId : !task.projectId
    );

    // Remove the dragged task from its position
    const [movedTask] = currentTasks.splice(sourceIndex, 1);

    // Insert the task at the new position
    currentTasks.splice(destinationIndex, 0, movedTask);

    // Update the full tasks array by replacing tasks for the current view
    // while keeping other tasks unchanged
    const newTasks = items.filter((task) =>
      selectedProjectId ? task.projectId !== selectedProjectId : task.projectId
    );

    setTasks([...newTasks, ...currentTasks]);
  };

  const handleEditTask = () => {
    if (!editingTask) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: editTaskTitle,
              description: editTaskDescription,
            }
          : task
      )
    );
    setEditingTask(null);
  };

  // Optionally, you can prevent rendering until data is loaded
  if (!isLoaded) {
    return null; // or return a loading spinner
  }

  return (
    <SidebarProvider>
      <div className='flex h-screen w-full bg-background dark:bg-zinc-950'>
        <Sidebar className='flex-shrink-0'>
          <SidebarHeader className='border-b p-4'>
            <div className='text-xl font-bold text-red-500'>Taskly</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className={cn(
                        'w-full justify-between',
                        !selectedProjectId && 'bg-accent'
                      )}
                      onClick={() => setSelectedProjectId(null)}
                    >
                      <span className='flex items-center gap-2'>
                        <Inbox className='h-4 w-4' />
                        Inbox
                      </span>
                      <Badge variant='secondary'>
                        {tasks.filter((t) => !t.projectId).length}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <div className='px-3 py-2'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-sm font-semibold text-muted-foreground'>
                    Projects
                  </h2>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={() => setShowProjectModal(true)}
                  >
                    <Plus className='h-4 w-4' />
                    <span className='sr-only'>Add project</span>
                  </Button>
                </div>
              </div>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        className={cn(
                          'w-full justify-between pl-3',
                          selectedProjectId === project.id && 'bg-accent'
                        )}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <span className='flex items-center'>
                          {project.name}
                        </span>
                        <Badge variant='secondary'>
                          {
                            tasks.filter((t) => t.projectId === project.id)
                              .length
                          }
                        </Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProjectId ? 'Edit Project' : 'Add Project'}
              </DialogTitle>
            </DialogHeader>
            <div className='py-4'>
              <Input
                placeholder='Project name'
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    editingProjectId
                      ? editProject(editingProjectId, newProjectName)
                      : addProject();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant='ghost'
                onClick={() => {
                  setShowProjectModal(false);
                  setEditingProjectId(null);
                  setNewProjectName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  editingProjectId
                    ? editProject(editingProjectId, newProjectName)
                    : addProject();
                }}
              >
                {editingProjectId ? 'Save Changes' : 'Add Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <div className='py-4 space-y-4'>
              <AddTaskForm
                onSubmit={(task) => {
                  addTask(task);
                  setShowAddTaskModal(false);
                }}
                onCancel={() => setShowAddTaskModal(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className='py-4 space-y-4'>
              {editingTask && (
                <EditTaskForm
                  task={{
                    title: editingTask.title,
                    description: editingTask.description,
                  }}
                  onSubmit={(updatedTask) => {
                    setTasks((prevTasks) =>
                      prevTasks.map((task) =>
                        task.id === editingTask.id
                          ? {
                              ...task,
                              title: updatedTask.title,
                              description: updatedTask.description,
                            }
                          : task
                      )
                    );
                    setEditingTask(null);
                  }}
                  onCancel={() => setEditingTask(null)}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        <main className='flex-1 w-full overflow-auto'>
          <div className='border-b p-4 flex items-center justify-between'>
            <h1 className='text-xl font-bold'>{getCurrentViewTitle()}</h1>
            {selectedProjectId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-muted-foreground'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingProjectId(selectedProjectId);
                      setNewProjectName(getCurrentViewTitle());
                      setShowProjectModal(true);
                    }}
                  >
                    Edit project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-red-600'
                    onClick={() => deleteProject(selectedProjectId)}
                  >
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={selectedProjectId || 'inbox'}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            'flex gap-3 py-2 px-4 items-center border-b hover:bg-[#27272a80]',
                            snapshot.isDragging && 'bg-accent'
                          )}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className='text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing'
                          >
                            <GripVertical className='h-4 w-4' />
                          </div>
                          <div className='relative flex h-4 w-4 items-center justify-center'>
                            <input
                              type='checkbox'
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className='peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 checked:border-red-500 checked:bg-red-500'
                            />
                            <svg
                              className='pointer-events-none absolute hidden h-2.5 w-2.5 text-white peer-checked:block'
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='4'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            >
                              <polyline points='20 6 9 17 4 12'></polyline>
                            </svg>
                          </div>
                          <div
                            className='flex-1 flex items-center gap-2 cursor-pointer'
                            onClick={() => {
                              setEditingTask(task);
                              setEditTaskTitle(task.title);
                              setEditTaskDescription(task.description || '');
                            }}
                          >
                            <p
                              className={cn(
                                'font-medium',
                                task.completed && 'line-through'
                              )}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <>
                                <span className='text-zinc-600 dark:text-zinc-500'>
                                  |
                                </span>
                                <p className='text-sm text-zinc-500 dark:text-zinc-600 truncate max-w-[400px]'>
                                  {task.description.length > 100
                                    ? task.description.substring(0, 100) + '...'
                                    : task.description}
                                </p>
                              </>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 text-muted-foreground'
                              >
                                <MoreHorizontal className='h-4 w-4' />
                                <span className='sr-only'>Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingTask(task);
                                  setEditTaskTitle(task.title);
                                  setEditTaskDescription(
                                    task.description || ''
                                  );
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-red-600'
                                onClick={() => deleteTask(task.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div
            onClick={() => setShowAddTaskModal(true)}
            className='flex gap-3 py-2 px-4 items-center border-b hover:bg-[#27272a80] cursor-pointer'
          >
            <div className='relative flex h-4 w-4 items-center justify-center'>
              <Plus className='h-4 w-4 text-muted-foreground' />
            </div>
            <div className='text-muted-foreground'>Add task</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
