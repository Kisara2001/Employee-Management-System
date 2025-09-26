import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type User = { _id: string; employee_code: string; first_name: string; last_name: string };
type Department = { _id: string; name: string };

type ParamType = 'date' | 'from' | 'to' | 'year' | 'month' | 'user' | 'department';
type ParamDef = { name: string; label: string; type: ParamType; optional?: boolean };

type ReportDef = {
  id: string;
  category: 'Attendance' | 'Shifts' | 'Payroll' | 'Organization';
  label: string;
  path: string; // relative to /api
  params: ParamDef[];
};

const REPORTS: ReportDef[] = [
  { id: 'att-daily', category: 'Attendance', label: 'Attendance Daily', path: '/reports/attendance/daily', params: [
    { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'date' },
  ]},
  { id: 'att-range', category: 'Attendance', label: 'Attendance Range', path: '/reports/attendance/range', params: [
    { name: 'from', label: 'From (YYYY-MM-DD)', type: 'from' },
    { name: 'to', label: 'To (YYYY-MM-DD)', type: 'to' },
    { name: 'userId', label: 'User', type: 'user', optional: true },
  ]},
  { id: 'att-summary', category: 'Attendance', label: 'Attendance Summary', path: '/reports/attendance/summary', params: [
    { name: 'year', label: 'Year', type: 'year' },
    { name: 'month', label: 'Month (1-12)', type: 'month' },
  ]},
  { id: 'att-late', category: 'Attendance', label: 'Late (placeholder)', path: '/reports/attendance/late', params: [
    { name: 'from', label: 'From (YYYY-MM-DD)', type: 'from', optional: true },
    { name: 'to', label: 'To (YYYY-MM-DD)', type: 'to', optional: true },
  ]},
  { id: 'shifts-coverage', category: 'Shifts', label: 'Shifts Coverage (date)', path: '/reports/shifts/coverage', params: [
    { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'date' },
  ]},
  { id: 'shifts-roster', category: 'Shifts', label: 'Shifts Roster (range)', path: '/reports/shifts/roster', params: [
    { name: 'from', label: 'From (YYYY-MM-DD)', type: 'from' },
    { name: 'to', label: 'To (YYYY-MM-DD)', type: 'to' },
  ]},
  { id: 'payroll-summary', category: 'Payroll', label: 'Payroll Summary (period)', path: '/reports/payroll/summary', params: [
    { name: 'year', label: 'Year', type: 'year' },
    { name: 'month', label: 'Month (1-12)', type: 'month' },
  ]},
  { id: 'payroll-payslip', category: 'Payroll', label: 'Payslip (by user/period)', path: '/reports/payroll/payslip', params: [
    { name: 'userId', label: 'User', type: 'user' },
    { name: 'year', label: 'Year', type: 'year' },
    { name: 'month', label: 'Month (1-12)', type: 'month' },
  ]},
  { id: 'salary-dept', category: 'Payroll', label: 'Salary Department Cost', path: '/reports/salary/department-cost', params: [
    { name: 'year', label: 'Year', type: 'year' },
    { name: 'month', label: 'Month (1-12)', type: 'month' },
  ]},
  { id: 'org-headcount', category: 'Organization', label: 'Headcount', path: '/reports/headcount', params: [
    { name: 'departmentId', label: 'Department', type: 'department', optional: true },
  ]},
  { id: 'org-profile', category: 'Organization', label: 'Employee Profile', path: '/reports/employees/profile', params: [
    { name: 'userId', label: 'User', type: 'user' },
  ]},
];

export default function ReportsPage() {
  const isAuthenticated = useAuthGuard();
  const [category, setCategory] = useState<ReportDef['category']>('Attendance');
  const [reportId, setReportId] = useState<string>(REPORTS.find(r => r.category === 'Attendance')!.id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [result, setResult] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);

  const reportsForCategory = useMemo(() => REPORTS.filter(r => r.category === category), [category]);
  const selectedReport = useMemo(() => REPORTS.find(r => r.id === reportId)!, [reportId]);

  useEffect(() => {
    // Init defaults on mount
    const now = new Date();
    const y = String(now.getUTCFullYear());
    const m = String(now.getUTCMonth() + 1);
    const d = now.toISOString().slice(0, 10);
    setValues({ year: y, month: m, date: d, from: d, to: d });
  }, []);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [u, d] = await Promise.all([
          api.get('/users', { params: { page: 1, limit: 200 } }),
          api.get('/departments', { params: { page: 1, limit: 200 } }),
        ]);
        setUsers((u.data?.data || []) as User[]);
        setDepartments((d.data?.data || []) as Department[]);
      } catch (e) {
        // ignore lookup errors; reports may still run without them
        console.error(e);
      }
    };
    loadLookups();
  }, []);

  useEffect(() => {
    // When category changes, pick first report in category
    const first = REPORTS.find(r => r.category === category);
    if (first) setReportId(first.id);
  }, [category]);

  const setValue = (name: string, v: string) => setValues((prev) => ({ ...prev, [name]: v }));

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const params: Record<string, string> = {};
      for (const p of selectedReport.params) {
        const val = values[p.name];
        if (!val && p.optional) continue;
        if (!val) continue; // skip missing
        // normalize month/year numbers as strings already
        params[p.name] = val;
      }
      // Request Excel by default (backend returns .xlsx). Use blob and trigger download.
      const res = await api.get(selectedReport.path, { params, responseType: 'blob' as any });
      const blob = res.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `${selectedReport.id}-${ts}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Report downloaded', description: selectedReport.label });
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown }, message?: string };
      setResult({ error: err?.response?.data || err?.message || 'Error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Select a report and fill in parameters.</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Report Selector</CardTitle>
          <CardDescription>Pick a category and report.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm mb-1 block">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as ReportDef['category'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Attendance">Attendance</SelectItem>
                <SelectItem value="Shifts">Shifts</SelectItem>
                <SelectItem value="Payroll">Payroll</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm mb-1 block">Report</label>
            <Select value={reportId} onValueChange={setReportId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {reportsForCategory.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
          <CardDescription>Fill required fields; optional fields can be left empty.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedReport.params.map((p) => {
            const common = { key: p.name };
            if (p.type === 'user') {
              return (
                <div {...common}>
                  <label className="text-sm mb-1 block">{p.label}</label>
                  <Select value={values[p.name] || ''} onValueChange={(v) => setValue(p.name, v)}>
                    <SelectTrigger><SelectValue placeholder={p.optional ? 'Optional' : 'Select user'} /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u._id} value={u._id}>{u.employee_code} - {u.first_name} {u.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            if (p.type === 'department') {
              return (
                <div {...common}>
                  <label className="text-sm mb-1 block">{p.label}</label>
                  <Select value={values[p.name] || ''} onValueChange={(v) => setValue(p.name, v)}>
                    <SelectTrigger><SelectValue placeholder={p.optional ? 'Optional' : 'Select department'} /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            // simple inputs for dates/numbers
            const placeholder = p.type === 'year' ? 'e.g. 2024' : p.type === 'month' ? '1-12' : 'YYYY-MM-DD';
            return (
              <div {...common}>
                <label className="text-sm mb-1 block">{p.label}</label>
                <Input
                  placeholder={placeholder}
                  value={values[p.name] || ''}
                  onChange={(e) => setValue(p.name, e.target.value)}
                />
              </div>
            );
          })}
          <div className="md:col-span-3 flex gap-2">
            <Button className="bg-gradient-primary" onClick={run} disabled={loading}>{loading ? 'Running...' : 'Run Report'}</Button>
          </div>
          {result && (
            <div className="md:col-span-3 p-3 rounded-md bg-muted text-sm overflow-auto max-h-[480px]">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
