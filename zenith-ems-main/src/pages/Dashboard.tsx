import { useEffect, useState } from "react";
import { Users, Clock, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import api from "@/lib/api";

type KPIData = {
  totalActiveEmployees: number;
  presentToday: number;
};

type SeriesPoint = { x: string; y: number };
type BreakdownItem = { label: string; value: number };

export default function Dashboard() {
  const isAuthenticated = useAuthGuard();
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [attendanceSeries, setAttendanceSeries] = useState<SeriesPoint[]>([]);
  const [deptPayroll, setDeptPayroll] = useState<BreakdownItem[]>([]);
  const [monthlyPayroll, setMonthlyPayroll] = useState<number>(0);
  const [overtimeMonth] = useState<number>(0); // placeholder (backend overtime is stubbed)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = now.getUTCMonth() + 1;
        const today = now.toISOString().slice(0, 10);
        const from = new Date(now);
        from.setUTCDate(from.getUTCDate() - 29);
        const fromStr = from.toISOString().slice(0, 10);

        // KPIs
        const { data: k } = await api.get("/dashboard/kpis", {
          params: { date: today },
        });
        setKpis(k);

        // Attendance trend (last 30 days)
        const { data: trend } = await api.get("/dashboard/attendance/trend", {
          params: { from: fromStr, to: today },
        });
        setAttendanceSeries(trend.series || []);

        // Department payroll breakdown for current month
        const { data: dept } = await api.get("/dashboard/payroll/department", {
          params: { year: yyyy, month: mm },
        });
        setDeptPayroll(dept.breakdown || []);

        // Monthly payroll total via reports summary (request JSON)
        const { data: summary } = await api.get("/reports/payroll/summary", {
          params: { year: yyyy, month: mm, format: "json" },
        });
        setMonthlyPayroll(summary?.data?.total_net || 0);
      } catch (error) {
        console.error("Failed to fetch KPIs:", error);
        // Fallback demo values if API fails
        setKpis({ totalActiveEmployees: 0, presentToday: 0 });
        setAttendanceSeries([]);
        setDeptPayroll([]);
        setMonthlyPayroll(0);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchKPIs();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your team today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Employees"
          value={kpis?.totalActiveEmployees || 0}
          change=""
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={kpis?.presentToday || 0}
          change=""
          changeType="positive"
          icon={Clock}
        />
        <StatCard
          title="Overtime Hours"
          value={overtimeMonth}
          change=""
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Monthly Payroll"
          value={`RS${(monthlyPayroll || 0).toLocaleString()}`}
          change=""
          changeType="neutral"
          icon={DollarSign}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
              Daily attendance over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceSeries.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No data</p>
                </div>
              </div>
            ) : (
              <div className="h-64 overflow-auto">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-medium">Date</div>
                  <div className="font-medium">Present</div>
                  <div className="font-medium">&nbsp;</div>
                  {attendanceSeries.map((p) => (
                    <div className="contents" key={p.x}>
                      <div>{p.x}</div>
                      <div>{p.y}</div>
                      <div className="h-2 bg-primary/20 rounded">
                        <div
                          className="h-2 bg-primary rounded"
                          style={{ width: `${Math.min(100, p.y)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle>Department Payroll</CardTitle>
            <CardDescription>
              Current month payroll by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deptPayroll.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No data</p>
                </div>
              </div>
            ) : (
              <div className="h-64 overflow-auto">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Department</div>
                  <div className="font-medium">Net Pay</div>
                  {deptPayroll.map((b, idx) => (
                    <div className="contents" key={`${b.label}-${idx}`}>
                      <div className="truncate">{b.label}</div>
                      <div>${b.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card animate-slide-up">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "New employee onboarded",
                time: "few days ago",
                type: "employee",
              },
              {
                action: "Payroll generated for September",
                time: "1 day ago",
                type: "payroll",
              },
              {
                action: "Department updated",
                time: "2 days ago",
                type: "department",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
