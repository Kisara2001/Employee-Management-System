import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

type Shift = { _id: string; name: string; start_time: string; end_time: string; break_minutes: number };

export default function ShiftsPage() {
  const isAuthenticated = useAuthGuard();
  const [items, setItems] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [breakMin, setBreakMin] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shifts', { params: { page: 1, limit: 100 } });
      setItems(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated]);

  const reset = () => { setEditingId(null); setName(''); setStart(''); setEnd(''); setBreakMin(0); };

  const submit = async () => {
    try {
      await api.post('/shifts', { name, start_time: start, end_time: end, break_minutes: Number(breakMin) });
      toast({ title: 'Shift created' });
      reset();
      load();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Create failed', description: message, variant: 'destructive' });
    }
  };

  const startEdit = (s: Shift) => { setEditingId(s._id); setName(s.name); setStart(s.start_time); setEnd(s.end_time); setBreakMin(s.break_minutes); };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.put(`/shifts/${editingId}`, { name, start_time: start, end_time: end, break_minutes: Number(breakMin) });
      toast({ title: 'Shift updated' });
      reset();
      load();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    try { await api.delete(`/shifts/${id}`); toast({ title: 'Shift deleted' }); load(); } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shifts</h1>
        <p className="text-muted-foreground">Define and manage work shifts.</p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Shift' : 'Add Shift'}</CardTitle>
          <CardDescription>Provide times in HH:mm format.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Start (HH:mm)" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input placeholder="End (HH:mm)" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Input placeholder="Break minutes" type="number" value={breakMin} onChange={(e) => setBreakMin(Number(e.target.value))} />
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
          <CardTitle>All Shifts</CardTitle>
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
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Break (min)</TableHead>
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s._id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.start_time}</TableCell>
                    <TableCell>{s.end_time}</TableCell>
                    <TableCell>{s.break_minutes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => startEdit(s)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(s._id)}>Delete</Button>
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
