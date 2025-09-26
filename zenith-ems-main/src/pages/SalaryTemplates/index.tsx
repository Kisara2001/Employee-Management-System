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
type Template = {
  _id: string;
  user: User;
  basic_salary: number;
  allowance_fixed?: number;
  allowance_percent?: number;
  deduction_fixed?: number;
  deduction_percent?: number;
  effective_from: string;
};

export default function SalaryTemplatesPage() {
  const isAuthenticated = useAuthGuard();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('');
  const [basic, setBasic] = useState<number | ''>('');
  const [af, setAf] = useState<number | ''>('');
  const [ap, setAp] = useState<number | ''>('');
  const [df, setDf] = useState<number | ''>('');
  const [dp, setDp] = useState<number | ''>('');
  const [eff, setEff] = useState('');

  const loadUsers = async () => { const res = await api.get('/users', { params: { page: 1, limit: 200 } }); setUsers(res.data?.data || []); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/salary-templates', { params: { page: 1, limit: 100 } }); setItems(res.data?.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) { loadUsers().then(load); } }, [isAuthenticated]);

  const reset = () => { setUser(''); setBasic(''); setAf(''); setAp(''); setDf(''); setDp(''); setEff(''); };

  const upsert = async () => {
    try {
      await api.post('/salary-templates', {
        user,
        basic_salary: Number(basic),
        allowance_fixed: af === '' ? 0 : Number(af),
        allowance_percent: ap === '' ? 0 : Number(ap),
        deduction_fixed: df === '' ? 0 : Number(df),
        deduction_percent: dp === '' ? 0 : Number(dp),
        effective_from: eff,
      });
      toast({ title: 'Template saved' });
      reset();
      load();
    } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Save failed', description: message, variant: 'destructive' }); }
  };

  const remove = async (uid: string) => { try { await api.delete(`/salary-templates/${uid}`); toast({ title: 'Template deleted' }); load(); } catch (e: unknown) { const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error'; toast({ title: 'Delete failed', description: message, variant: 'destructive' }); } };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Salary Templates</h1>
        <p className="text-muted-foreground">Maintain salary templates per employee.</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Upsert Template</CardTitle>
          <CardDescription>Values default to 0 if not provided.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={user} onValueChange={setUser}>
            <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => (<SelectItem key={u._id} value={u._id}>{u.employee_code} - {u.first_name} {u.last_name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input placeholder="Basic salary" type="number" value={basic} onChange={(e) => setBasic(e.target.value ? Number(e.target.value) : '')} />
          <Input placeholder="Allowance fixed" type="number" value={af} onChange={(e) => setAf(e.target.value ? Number(e.target.value) : '')} />
          <Input placeholder="Allowance %" type="number" value={ap} onChange={(e) => setAp(e.target.value ? Number(e.target.value) : '')} />
          <Input placeholder="Deduction fixed" type="number" value={df} onChange={(e) => setDf(e.target.value ? Number(e.target.value) : '')} />
          <Input placeholder="Deduction %" type="number" value={dp} onChange={(e) => setDp(e.target.value ? Number(e.target.value) : '')} />
          <Input placeholder="Effective from (ISO date)" value={eff} onChange={(e) => setEff(e.target.value)} />
          <Button className="bg-gradient-primary" onClick={upsert}>Save</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Templates</CardTitle>
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
                  <TableHead>Basic</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t._id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{t.user?.employee_code} - {t.user?.first_name} {t.user?.last_name}</TableCell>
                    <TableCell>{t.basic_salary}</TableCell>
                    <TableCell>{(t.allowance_fixed ?? 0) + (t.allowance_percent ?? 0) + ' (F+' + (t.allowance_fixed ?? 0) + ', %' + (t.allowance_percent ?? 0) + ')'}</TableCell>
                    <TableCell>{(t.deduction_fixed ?? 0) + (t.deduction_percent ?? 0) + ' (F+' + (t.deduction_fixed ?? 0) + ', %' + (t.deduction_percent ?? 0) + ')'}</TableCell>
                    <TableCell>{new Date(t.effective_from).toISOString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => remove(t.user?._id || '')}>Delete</Button>
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
