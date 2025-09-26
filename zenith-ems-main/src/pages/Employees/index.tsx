import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit2, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department?: {
    name?: string;
  };
  designation?: {
    title?: string;
  };
  status: string; // normalized lowercase from backend employment_status
  createdAt?: string;
}

export default function Employees() {
  const isAuthenticated = useAuthGuard();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = useCallback(async () => {
      try {
        const response = await api.get('/users', {
          params: {
            q: searchTerm || undefined,
            page: 1,
            limit: 50,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          },
        });

        type BackendUser = {
          _id: string;
          employee_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string;
          department?: { _id: string; name?: string } | null;
          designation?: { _id: string; title?: string } | null;
          employment_status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
          createdAt?: string;
        };

        const payload = response.data?.data as BackendUser[] | undefined;
        const mapped: Employee[] = (payload || []).map((u) => ({
          id: u._id,
          code: u.employee_code,
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          phone: u.phone || '',
          department: { name: u.department?.name || undefined },
          designation: { title: u.designation?.title || undefined },
          status: (u.employment_status || 'ACTIVE').toLowerCase(),
          createdAt: u.createdAt,
        }));

        setEmployees(mapped);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    }, [searchTerm]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchEmployees();
    }
  }, [isAuthenticated, searchTerm, fetchEmployees]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
      case 'INACTIVE':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization's employees and their information.
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/employees/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card animate-slide-up">
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>View and manage all employees in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{employee.code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                          <div className="text-sm text-muted-foreground">{employee.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.department?.name}</TableCell>
                      <TableCell>{employee.designation?.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card">
                            <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}/edit`)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                try {
                                  await api.delete(`/users/${employee.id}`);
                                  toast({ title: 'Employee deactivated' });
                                  setLoading(true);
                                  await fetchEmployees();
                                } catch (e) {
                                  toast({ title: 'Delete failed', variant: 'destructive' });
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && employees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first employee.'}
              </p>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/employees/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
