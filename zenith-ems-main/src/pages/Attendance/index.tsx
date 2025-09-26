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
type Attendance = { _id: string; user: User; att_date: string; status: 'P'|'A'|'L'|'H'; check_in?: string; check_out?: string; hours_worked?: number };

export default function AttendancePage() {
  const isAuthenticated = useAuthGuard();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<'all' | string>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState<'P'|'A'|'L'|'H'|'all'>('all');

  const [formUser, setFormUser] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStatus, setFormStatus] = useState<'P'|'A'|'L'|'H'>('P');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [hours, setHours] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadUsers = async () => { const res = await api.get('/users', { params: { page: 1, limit: 200 } }); setUsers(res.data?.data || []); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance', { params: { page: 1, limit: 100, userId: userId === 'all' ? undefined : userId, from: from || undefined, to: to || undefined } });
      let data: Attendance[] = res.data?.data || [];
      if (status !== 'all') data = data.filter((r) => r.status === status);
      setItems(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) { loadUsers().then(load); } }, [isAuthenticated]);

  const applyFilters = () => load();

  const resetForm = () => { setEditingId(null); setFormUser(''); setFormDate(''); setFormStatus('P'); setCheckIn(''); setCheckOut(''); setHours(''); };

  const submit = async () => {
    try {
      await api.post('/attendance', { user: formUser, att_date: formDate, status: formStatus, check_in: checkIn || undefined, check_out: checkOut || undefined, hours_worked: hours === '' ? undefined : Number(hours) });
      toast({ title: 'Attendance created' });
      resetForm();
      load();
    } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Create failed', description: message, variant: 'destructive' }); }
  };

  const startEdit = (a: Attendance) => { setEditingId(a._id); setFormUser(a.user?._id || ''); setFormDate(new Date(a.att_date).toISOString()); setFormStatus(a.status); setCheckIn(a.check_in || ''); setCheckOut(a.check_out || ''); setHours(a.hours_worked ?? ''); };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.put(`/attendance/${editingId}`, { user: formUser || undefined, att_date: formDate || undefined, status: formStatus || undefined, check_in: checkIn || undefined, check_out: checkOut || undefined, hours_worked: hours === '' ? undefined : Number(hours) });
      toast({ title: 'Attendance updated' });
      resetForm();
      load();
    } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Update failed', description: message, variant: 'destructive' }); }
  };

  const remove = async (id: string) => { try { await api.delete(`/attendance/${id}`); toast({ title: 'Attendance deleted' }); load(); } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Delete failed', description: message, variant: 'destructive' }); } };

  const doCheckIn = async () => { try { await api.post('/attendance/check-in', { userId: formUser }); toast({ title: 'Checked in' }); load(); } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Check-in failed', description: message, variant: 'destructive' }); } };
  const doCheckOut = async () => { try { await api.post('/attendance/check-out', { userId: formUser }); toast({ title: 'Checked out' }); load(); } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Check-out failed', description: message, variant: 'destructive' }); } };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Track and manage employee attendance.</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter by employee and date range.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select value={userId} onValueChange={(v) => setUserId(v as 'all' | string)}>
            <SelectTrigger><SelectValue placeholder="All employees" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {users.map((u) => (<SelectItem key={u._id} value={u._id}>{u.employee_code} - {u.first_name} {u.last_name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input placeholder="From (YYYY-MM-DD)" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input placeholder="To (YYYY-MM-DD)" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={status} onValueChange={(v) => setStatus(v as 'P'|'A'|'L'|'H'|'all')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="P">Present</SelectItem>
              <SelectItem value="A">Absent</SelectItem>
              <SelectItem value="L">Leave</SelectItem>
              <SelectItem value="H">Holiday</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-primary" onClick={applyFilters}>Apply</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Attendance' : 'Add Attendance'}</CardTitle>
          <CardDescription>Use ISO timestamps for check-in/out if provided.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select value={formUser} onValueChange={setFormUser}>
            <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => (<SelectItem key={u._id} value={u._id}>{u.employee_code} - {u.first_name} {u.last_name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input placeholder="Date (YYYY-MM-DD)" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          <Select value={formStatus} onValueChange={(v) => setFormStatus(v as 'P'|'A'|'L'|'H')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="P">Present</SelectItem>
              <SelectItem value="A">Absent</SelectItem>
              <SelectItem value="L">Leave</SelectItem>
              <SelectItem value="H">Holiday</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Check-in (ISO)" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          <Input placeholder="Check-out (ISO)" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          <Input placeholder="Hours worked" type="number" value={hours} onChange={(e) => setHours(e.target.value ? Number(e.target.value) : '')} />
          <div className="md:col-span-6 flex gap-2">
            {editingId ? (
              <>
                <Button className="bg-gradient-primary" onClick={saveEdit}>Save</Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </>
            ) : (
              <Button className="bg-gradient-primary" onClick={submit}>Create</Button>
            )}
            <Button variant="outline" onClick={doCheckIn}>Check-in (Today)</Button>
            <Button variant="outline" onClick={doCheckOut}>Check-out (Today)</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Records</CardTitle>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => (
                  <TableRow key={r._id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{r.user?.employee_code} - {r.user?.first_name} {r.user?.last_name}</TableCell>
                    <TableCell>{new Date(r.att_date).toISOString().substring(0,10)}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.check_in ? new Date(r.check_in).toISOString() : '-'}</TableCell>
                    <TableCell>{r.check_out ? new Date(r.check_out).toISOString() : '-'}</TableCell>
                    <TableCell>{r.hours_worked ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => startEdit(r)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => remove(r._id)}>Delete</Button>
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
