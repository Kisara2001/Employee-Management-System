import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  employee_code: z.string().min(1, 'Employee code is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  employment_status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).default('ACTIVE'),
  role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
});

type FormValues = z.infer<typeof schema>;
type Option = { _id: string; name?: string; title?: string };

export default function EditEmployee() {
  const isAuthenticated = useAuthGuard();
  const navigate = useNavigate();
  const { id } = useParams();
  const [departments, setDepartments] = useState<Option[]>([]);
  const [designations, setDesignations] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const selectedDepartment = form.watch('department');

  useEffect(() => {
    const load = async () => {
      try {
        const [deps, userRes] = await Promise.all([
          api.get('/departments', { params: { page: 1, limit: 100 } }),
          api.get(`/users/${id}`),
        ]);
        setDepartments(deps.data?.data || []);
        const u = userRes.data;
        form.reset({
          employee_code: u.employee_code,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          phone: u.phone || '',
          department: u.department?._id || '',
          designation: u.designation?._id || '',
          employment_status: u.employment_status || 'ACTIVE',
          role: u.role || 'EMPLOYEE',
        });
      } catch (e) {
        toast({ title: 'Failed to load user', variant: 'destructive' });
      }
    };
    if (isAuthenticated && id) load();
  }, [isAuthenticated, id]);

  useEffect(() => {
    const loadDesigs = async () => {
      try {
        const res = await api.get('/designations', { params: { page: 1, limit: 100, departmentId: selectedDepartment || undefined } });
        setDesignations((res.data?.data || []) as Option[]);
      } catch {}
    };
    loadDesigs();
  }, [selectedDepartment]);

  const canSubmit = useMemo(() => form.formState.isValid && !loading, [form.formState.isValid, loading]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await api.put(`/users/${id}` , values);
      toast({ title: 'Employee updated' });
      navigate(`/employees/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: 'Update failed', description: err.response?.data?.message || 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Employee</h1>
          <p className="text-muted-foreground">Update employee details.</p>
        </div>
      </div>

      <Card className="glass-card animate-slide-up">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Modify any field and save.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="employee_code" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Code</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="first_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="last_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Password (leave blank to keep)</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="department" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d._id} value={d._id}>{d.name || 'Unnamed'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="designation" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                      <SelectContent>
                        {designations.map((d) => (
                          <SelectItem key={d._id} value={d._id}>{d.title || 'Untitled'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="employment_status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="role" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={!canSubmit || loading} className="bg-gradient-primary hover:opacity-90">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

