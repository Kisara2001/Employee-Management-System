import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type Department = { _id: string; name: string };
type Designation = { _id: string; title: string; level?: string; department: Department };

export default function DesignationsPage() {
  const isAuthenticated = useAuthGuard();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [items, setItems] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadDeps = async () => {
    const res = await api.get('/departments', { params: { page: 1, limit: 100 } });
    setDepartments(res.data?.data || []);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/designations', { params: { page: 1, limit: 100, departmentId: department || undefined } });
      setItems(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDeps().then(load);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [department]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setLevel('');
  };

  const submit = async () => {
    try {
      if (!department || !title.trim()) return;
      await api.post('/designations', { department, title, level: level || undefined });
      toast({ title: 'Designation created' });
      resetForm();
      load();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Create failed', description: message, variant: 'destructive' });
    }
  };

  const startEdit = (d: Designation) => {
    setEditingId(d._id);
    setDepartment(d.department?._id || department);
    setTitle(d.title);
    setLevel(d.level || '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.put(`/designations/${editingId}`, { department, title, level: level || undefined });
      toast({ title: 'Designation updated' });
      resetForm();
      load();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/designations/${id}`);
      toast({ title: 'Designation deleted' });
      load();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Designations</h1>
        <p className="text-muted-foreground">Manage designations within departments.</p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Designation' : 'Add Designation'}</CardTitle>
          <CardDescription>Select a department and provide a title.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Level (optional)" value={level} onChange={(e) => setLevel(e.target.value)} />
          {editingId ? (
            <div className="flex gap-2">
              <Button className="bg-gradient-primary" onClick={saveEdit}>Save</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          ) : (
            <Button className="bg-gradient-primary" onClick={submit}>Create</Button>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Designations</CardTitle>
          <CardDescription>First 100 records shown.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Department</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d._id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{d.department?.name}</TableCell>
                    <TableCell>{d.title}</TableCell>
                    <TableCell>{d.level}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => startEdit(d)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(d._id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
