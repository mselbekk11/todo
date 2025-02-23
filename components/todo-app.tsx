'use client';

import { useState, useEffect } from 'react';
import { Inbox, Plus, Trash2, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const getCurrentViewTitle = () => {
    if (!selectedProjectId) return 'Inbox';
    const project = projects.find((p) => p.id === selectedProjectId);
    return project?.name || 'Inbox';
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
            <div className='text-xl font-bold text-red-500'>todoist</div>
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
                          'w-full justify-between',
                          selectedProjectId === project.id && 'bg-accent'
                        )}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <span className='flex items-center gap-2'>
                          <Layout className='h-4 w-4' />
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
              <DialogTitle>Add Project</DialogTitle>
            </DialogHeader>
            <div className='py-4'>
              <Input
                placeholder='Project name'
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addProject();
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant='ghost'
                onClick={() => setShowProjectModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={addProject}>Add Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <div className='py-4'>
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

        <main className='flex-1 w-full overflow-auto'>
          <div className='border-b p-3 flex items-center justify-between'>
            <h1 className='text-xl font-bold'>{getCurrentViewTitle()}</h1>
            <Button
              onClick={() => setShowAddTaskModal(true)}
              className='gap-2'
              variant='default'
              size='sm'
            >
              <Plus className='h-4 w-4' />
              Add task
            </Button>
          </div>
          <div className=''>
            <div>
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex gap-3 py-2 px-4 items-center border-b hover:bg-[#27272a80]'
                  )}
                >
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
                  <div className='flex-1'>
                    <p
                      className={cn(
                        'font-medium',
                        task.completed && 'line-through'
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => deleteTask(task.id)}
                    className='h-8 w-8 text-muted-foreground hover:text-red-500'
                  >
                    <Trash2 className='h-4 w-4' />
                    <span className='sr-only'>Delete task</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
