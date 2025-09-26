import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type User = { _id: string; first_name: string; last_name: string; employee_code: string };
type Shift = { _id: string; name: string };
type Assignment = { _id: string; user: User; shift: Shift; start_date: string; end_date?: string };

export default function ShiftAssignmentsPage() {
  const isAuthenticated = useAuthGuard();
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('');
  const [shift, setShift] = useState('');
  const [start_date, setStart] = useState('');
  const [end_date, setEnd] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadLookups = async () => {
    const [u, s] = await Promise.all([
      api.get('/users', { params: { page: 1, limit: 200 } }),
      api.get('/shifts', { params: { page: 1, limit: 200 } })
    ]);
    setUsers((u.data?.data || []) as User[]);
    setShifts(s.data?.data || []);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employee-shifts', { params: { page: 1, limit: 100 } });
      setItems(res.data?.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) { loadLookups().then(load); } }, [isAuthenticated]);

  const reset = () => { setEditingId(null); setUser(''); setShift(''); setStart(''); setEnd(''); };

  const submit = async () => {
    try {
      await api.post('/employee-shifts', { user, shift, start_date, end_date: end_date || undefined });
      toast({ title: 'Assignment created' });
      reset();
      load();
    } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Create failed', description: message, variant: 'destructive' }); }
  };

  const startEdit = (a: Assignment) => { setEditingId(a._id); setUser(a.user?._id || ''); setShift(a.shift?._id || ''); setStart(new Date(a.start_date).toISOString()); setEnd(a.end_date ? new Date(a.end_date).toISOString() : ''); };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.put(`/employee-shifts/${editingId}`, { user, shift, start_date, end_date: end_date || undefined });
      toast({ title: 'Assignment updated' });
      reset();
      load();
    } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Update failed', description: message, variant: 'destructive' }); }
  };

  const remove = async (id: string) => { try { await api.delete(`/employee-shifts/${id}`); toast({ title: 'Assignment deleted' }); load(); } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Delete failed', description: message, variant: 'destructive' }); } };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shift Assignments</h1>
        <p className="text-muted-foreground">Assign shifts to employees.</p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Assignment' : 'New Assignment'}</CardTitle>
          <CardDescription>Use ISO date string for dates.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select value={user} onValueChange={setUser}>
            <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u._id} value={u._id}>{u.employee_code} - {u.first_name} {u.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={shift} onValueChange={setShift}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>
              {shifts.map((s) => (
                <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Start (ISO date)" value={start_date} onChange={(e) => setStart(e.target.value)} />
          <Input placeholder="End (ISO date)" value={end_date} onChange={(e) => setEnd(e.target.value)} />
          {editingId ? (
            <div className="flex gap-2">
              <Button className="bg-gradient-primary" onClick={saveEdit}>Save</Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          ) : (
            <Button className="bg-gradient-primary" onClick={submit}>Create</Button>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>First 100 records shown.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a._id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{a.user?.employee_code} - {a.user?.first_name} {a.user?.last_name}</TableCell>
                    <TableCell>{a.shift?.name}</TableCell>
                    <TableCell>{new Date(a.start_date).toISOString()}</TableCell>
                    <TableCell>{a.end_date ? new Date(a.end_date).toISOString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => startEdit(a)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(a._id)}>Delete</Button>
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
