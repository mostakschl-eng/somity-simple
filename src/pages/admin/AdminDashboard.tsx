import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getAllMembers } from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Wallet, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getAllMembers,
  });

  const statCards = [
    { label: 'মোট সদস্য', value: stats?.totalMembers ?? 0, icon: Users, color: 'text-primary' },
    { label: 'সক্রিয় সদস্য', value: stats?.activeMembers ?? 0, icon: UserCheck, color: 'text-success' },
    { label: 'মোট জমা', value: formatCurrency(stats?.totalDeposit ?? 0), icon: Wallet, color: 'text-info' },
    { label: 'মোট বকেয়া', value: formatCurrency(stats?.totalDue ?? 0), icon: AlertTriangle, color: 'text-accent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">সমিতির সামগ্রিক অবস্থা</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{statsLoading ? '...' : s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">সাম্প্রতিক সদস্যগণ</CardTitle>
          <Link to="/admin/members" className="text-sm text-primary hover:underline">সব দেখুন</Link>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
          ) : !members?.length ? (
            <p className="text-muted-foreground">কোনো সদস্য নেই। প্রথমে একজন সদস্য তৈরি করুন।</p>
          ) : (
            <div className="space-y-3">
              {members.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  to={`/admin/members/${m.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {m.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">সদস্য নং: {m.member_no || '-'}</p>
                    </div>
                  </div>
                  <Badge variant={m.is_active ? 'default' : 'secondary'}>
                    {m.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
