import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getAllMembers } from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, UserCheck, Wallet, AlertTriangle, TrendingUp, 
  ArrowUpRight, Activity,
  PieChart as PieChartIcon, BarChart3, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const chartConfig = {
  deposit: { label: 'জমা', color: 'hsl(168 60% 32%)' },
  expense: { label: 'ব্যয়', color: 'hsl(35 90% 55%)' },
  due: { label: 'বকেয়া', color: 'hsl(0 72% 51%)' },
  balance: { label: 'ব্যালেন্স', color: 'hsl(210 80% 55%)' },
  active: { label: 'সক্রিয়', color: 'hsl(142 60% 40%)' },
  inactive: { label: 'নিষ্ক্রিয়', color: 'hsl(200 10% 45%)' },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getAllMembers,
  });

  const activeCount = members?.filter(m => m.is_active).length ?? 0;
  const inactiveCount = (members?.length ?? 0) - activeCount;

  const pieData = [
    { name: 'সক্রিয়', value: activeCount, fill: 'hsl(142 60% 40%)' },
    { name: 'নিষ্ক্রিয়', value: inactiveCount, fill: 'hsl(200 10% 45%)' },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'মোট সদস্য', value: stats?.totalMembers ?? 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10', trend: null },
    { label: 'সক্রিয় সদস্য', value: stats?.activeMembers ?? 0, icon: UserCheck, color: 'text-success', bg: 'bg-success/10',
      trend: stats?.totalMembers ? `${Math.round((stats.activeMembers / stats.totalMembers) * 100)}%` : null },
    { label: 'মোট জমা', value: formatCurrency(stats?.totalDeposit ?? 0), icon: TrendingUp, color: 'text-info', bg: 'bg-info/10', trend: null },
    { label: 'মোট বকেয়া', value: formatCurrency(stats?.totalDue ?? 0), icon: AlertTriangle, color: 'text-accent', bg: 'bg-accent/10', trend: null },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">ড্যাশবোর্ড</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">সমিতির সামগ্রিক অবস্থা</p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-2 py-1 text-xs">
          <Activity className="h-3 w-3 text-success" />
          লাইভ
        </Badge>
      </div>

      {/* Stat Cards - 2 cols on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="relative overflow-hidden">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${s.bg}`}>
                  <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                </div>
                {s.trend && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5">
                    {s.trend}
                  </Badge>
                )}
              </div>
              <div className="mt-2 sm:mt-3">
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">{s.label}</p>
                <p className="text-base sm:text-2xl font-bold mt-0.5 truncate">{statsLoading ? '...' : s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts - stacked on mobile */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 pb-2 px-3 sm:px-6">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm sm:text-base">আর্থিক সারসংক্ষেপ</CardTitle>
              <CardDescription className="text-xs">জমা, ব্যয় ও বকেয়ার তুলনা</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ChartContainer config={chartConfig} className="h-[180px] sm:h-[250px] w-full">
              <BarChart data={[
                { name: 'জমা', deposit: stats?.totalDeposit ?? 0 },
                { name: 'ব্যয়', expense: stats?.totalExpense ?? 0 },
                { name: 'বকেয়া', due: stats?.totalDue ?? 0 },
                { name: 'ব্যালেন্স', balance: stats?.totalBalance ?? 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deposit" fill="var(--color-deposit)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="due" fill="var(--color-due)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="balance" fill="var(--color-balance)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2 px-3 sm:px-6">
            <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm sm:text-base">সদস্য স্ট্যাটাস</CardTitle>
              <CardDescription className="text-xs">সক্রিয় / নিষ্ক্রিয়</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-2 sm:px-6">
            <ChartContainer config={chartConfig} className="h-[160px] sm:h-[200px] w-full">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-success" />
                সক্রিয় ({activeCount})
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-muted-foreground" />
                নিষ্ক্রিয় ({inactiveCount})
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats - 1 col on mobile, 3 on desktop */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-3 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-info/10">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-info" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">মোট ব্যয়</p>
              <p className="text-lg sm:text-xl font-bold">{statsLoading ? '...' : formatCurrency(stats?.totalExpense ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-3 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">বর্তমান ব্যালেন্স</p>
              <p className="text-lg sm:text-xl font-bold">{statsLoading ? '...' : formatCurrency(stats?.totalBalance ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-3 sm:p-5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-accent/10">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">মোট রেকর্ড</p>
              <p className="text-lg sm:text-xl font-bold">{statsLoading ? '...' : stats?.totalRecords ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <CardTitle className="text-sm sm:text-base">সাম্প্রতিক সদস্যগণ</CardTitle>
          </div>
          <Link to="/admin/members" className="text-xs sm:text-sm text-primary hover:underline font-medium">
            সব দেখুন →
          </Link>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {membersLoading ? (
            <p className="text-muted-foreground text-sm">লোড হচ্ছে...</p>
          ) : !members?.length ? (
            <div className="text-center py-6">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">কোনো সদস্য নেই</p>
              <Link to="/admin/members/new" className="text-xs text-primary hover:underline mt-1 inline-block">
                + নতুন সদস্য যোগ করুন
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {members.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  to={`/admin/members/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-2.5 sm:p-3 transition-all hover:bg-muted active:bg-muted/80"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-bold text-primary shrink-0">
                      {m.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        #{m.member_no || '-'} • {m.mobile || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Badge variant={m.is_active ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0.5">
                      {m.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </Badge>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
