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
type Run = { _id: string; user: User; period_year: number; period_month: number; net_pay: number; createdAt?: string };

export default function PayrollPage() {
  const isAuthenticated = useAuthGuard();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getUTCFullYear());
  const [month, setMonth] = useState<number>(new Date().getUTCMonth() + 1);
  const [user, setUser] = useState<'all' | string>('all');

  const loadUsers = async () => { const res = await api.get('/users', { params: { page: 1, limit: 200 } }); setUsers(res.data?.data || []); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/payroll', { params: { page: 1, limit: 100, year, month, userId: user === 'all' ? undefined : user } }); setItems(res.data?.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) { loadUsers().then(load); } }, [isAuthenticated]);

  const generate = async () => {
    try {
      await api.post('/payroll/generate', { year, month, userId: user === 'all' ? undefined : user });
      toast({ title: 'Payroll generated' });
      load();
    } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Generate failed', description: message, variant: 'destructive' }); }
  };

  const remove = async (id: string) => { try { await api.delete(`/payroll/${id}`); toast({ title: 'Deleted' }); load(); } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Delete failed', description: message, variant: 'destructive' }); } };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-muted-foreground">Generate and view payroll runs.</p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Generate Payroll</CardTitle>
          <CardDescription>Select period and optional user.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input placeholder="Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <Input placeholder="Month (1-12)" type="number" value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          <Select value={user} onValueChange={(v) => setUser(v as 'all' | string)}>
            <SelectTrigger><SelectValue placeholder="All users" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {users.map((u) => (<SelectItem key={u._id} value={u._id}>{u.employee_code} - {u.first_name} {u.last_name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button className="bg-gradient-primary" onClick={load}>Filter</Button>
          <Button className="bg-gradient-primary" onClick={generate}>Generate</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Runs</CardTitle>
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
                  <TableHead>Period</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => (
                  <TableRow key={r._id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{r.user?.employee_code} - {r.user?.first_name} {r.user?.last_name}</TableCell>
                    <TableCell>{r.period_year}-{String(r.period_month).padStart(2, '0')}</TableCell>
                    <TableCell>{r.net_pay}</TableCell>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toISOString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => remove(r._id)}>Delete</Button>
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
