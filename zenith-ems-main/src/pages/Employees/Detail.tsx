import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type User = {
  _id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: { _id: string; name?: string } | null;
  designation?: { _id: string; title?: string } | null;
  employment_status?: string;
};

export default function EmployeeDetail() {
  const isAuthenticated = useAuthGuard();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setUser(data);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && id) load();
  }, [isAuthenticated, id]);

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee</h1>
          <p className="text-muted-foreground">View employee details</p>
        </div>
        <Button onClick={() => navigate(`/employees/${id}/edit`)}>Edit</Button>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{user ? `${user.first_name} ${user.last_name}` : 'Loading...'}</CardTitle>
          <CardDescription>{user?.employee_code}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading...</div>
          ) : user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Email:</span> {user.email}</div>
              <div><span className="font-medium">Phone:</span> {user.phone || '-'}</div>
              <div><span className="font-medium">Department:</span> {user.department?.name || '—'}</div>
              <div><span className="font-medium">Designation:</span> {user.designation?.title || '—'}</div>
              <div><span className="font-medium">Status:</span> {user.employment_status}</div>
            </div>
          ) : (
            <div className="p-4 text-destructive">Employee not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

