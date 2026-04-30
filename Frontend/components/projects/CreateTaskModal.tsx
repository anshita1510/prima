'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { projectService } from '@/app/services/project.service';
import { taskService } from '@/app/services/task.service';
import api from '@/lib/axios';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  projectName?: string;
}

interface Employee {
  id: number;
  name: string;
  designation: string;
}

export function CreateTaskModal({ isOpen, onClose, onSuccess, projectId, projectName }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dueDate: '',
    assignedToId: '',
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProjectMembers();
    }
  }, [isOpen, projectId]);

  const loadProjectMembers = async () => {
    setDataLoading(true);
    try {
      const response = await api.get(`/api/projects/${projectId}/members`);
      const data = response.data?.data;
      // Backend returns array of ProjectMember: { id, role, employee: { id, name, designation } }
      if (Array.isArray(data)) {
        const members: Employee[] = data
          .filter((m: any) => m.employee)
          .map((m: any) => ({
            id: m.employee.id,
            name: m.employee.name,
            designation: m.employee.designation,
          }));
        setEmployees(members);
      } else if (data?.members || data?.owner) {
        // Fallback: { owner, members } shape
        const all: Employee[] = [];
        if (data.owner) all.push(data.owner);
        if (Array.isArray(data.members)) all.push(...data.members);
        setEmployees(all);
      }
    } catch {
      setEmployees([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) { setError('Task title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await taskService.createTask({
        title: formData.title,
        description: formData.description,
        projectId,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : undefined,
      });
      onSuccess();
      handleClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Task{projectName ? ` — ${projectName}` : ''}</DialogTitle>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>
        )}

        {dataLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Task title"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Assign To</Label>
              <Select value={formData.assignedToId} onValueChange={(v) => setFormData({ ...formData, assignedToId: v })}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} — {emp.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Create Task
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
