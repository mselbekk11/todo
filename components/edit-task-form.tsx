'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditTaskFormProps {
  task: {
    title: string;
    description?: string;
  };
  onSubmit: (task: { title: string; description?: string }) => void;
  onCancel: () => void;
}

export default function EditTaskForm({
  task,
  onSubmit,
  onCancel,
}: EditTaskFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  // Update form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-4'>
        <Input
          placeholder='Task title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className='focus-visible:ring-1'
        />
        <Textarea
          placeholder='Description (optional)'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className='flex justify-end gap-2'>
        <Button type='button' variant='ghost' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>Save Changes</Button>
      </div>
    </form>
  );
}
