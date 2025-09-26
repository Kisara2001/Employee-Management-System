import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

type Department = { _id: string; name: string; description?: string };

export default function DepartmentsPage() {
  const isAuthenticated = useAuthGuard();
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments', { params: { page: 1, limit: 100 } });
      setItems(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const submit = async () => {
    try {
      if (!name.trim()) return;
      await api.post('/departments', { name, description });
      setName('');
      setDescription('');
      toast({ title: 'Department created' });
      load();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Create failed', description: message, variant: 'destructive' });
    }
  };

  const startEdit = (dep: Department) => {
    setEditingId(dep._id);
    setName(dep.name);
    setDescription(dep.description || '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.put(`/departments/${editingId}`, { name, description });
      setEditingId(null);
      setName('');
      setDescription('');
      toast({ title: 'Department updated' });
      load();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/departments/${id}`);
      toast({ title: 'Department deleted' });
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
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-muted-foreground">Manage your company departments.</p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Department' : 'Add Department'}</CardTitle>
          <CardDescription>Provide a name and optional description.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          {editingId ? (
            <div className="flex gap-2">
              <Button className="bg-gradient-primary" onClick={saveEdit}>Save</Button>
              <Button variant="outline" onClick={() => { setEditingId(null); setName(''); setDescription(''); }}>Cancel</Button>
            </div>
          ) : (
            <Button className="bg-gradient-primary" onClick={submit}>Create</Button>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>First 100 records shown.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d._id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.description}</TableCell>
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
