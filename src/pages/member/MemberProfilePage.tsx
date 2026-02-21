import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getMemberRecords, getMember } from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, User, Phone, Hash, Calendar, Wallet, 
  TrendingUp, AlertTriangle, Receipt, Activity, FileDown
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { generateReceiptPDF } from '@/lib/generateReceipt';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const chartConfig = {
  deposit: { label: 'জমা', color: 'hsl(168 60% 32%)' },
  due: { label: 'বকেয়া', color: 'hsl(0 72% 51%)' },
} satisfies ChartConfig;

export default function MemberProfilePage() {
  const { user } = useAuth();
  const [yearFilter, setYearFilter] = useState<string>('all');

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: () => getMember(user!.id),
    enabled: !!user,
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['my-records', user?.id, yearFilter],
    queryFn: () => getMemberRecords(user!.id, yearFilter !== 'all' ? parseInt(yearFilter) : undefined),
    enabled: !!user,
  });

  const years = [...new Set(records?.map(r => r.year))].sort((a, b) => b - a);

  // Calculate totals
  const totals = useMemo(() => {
    if (!records?.length) return { deposit: 0, expense: 0, due: 0, balance: 0, count: 0 };
    return {
      deposit: records.reduce((s, r) => s + (Number(r.total_deposit) || 0), 0),
      expense: records.reduce((s, r) => s + (Number(r.total_expense) || 0), 0),
      due: records.reduce((s, r) => s + (Number(r.due) || 0), 0),
      balance: records.reduce((s, r) => s + (Number(r.current_balance) || 0), 0),
      count: records.length,
    };
  }, [records]);

  // Chart data
  const chartData = useMemo(() => {
    if (!records) return [];
    return records.map(r => ({
      name: `${r.month_name?.substring(0, 3)}`,
      deposit: Number(r.monthly_deposit) || 0,
      due: Number(r.due) || 0,
    }));
  }, [records]);

  const handleDownloadReceipt = (record: any) => {
    if (!profile) return;
    generateReceiptPDF(record, profile);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          আমার প্রোফাইল
        </h1>
        <p className="text-muted-foreground">আপনার সমিতির তথ্য ও আর্থিক সারসংক্ষেপ</p>
      </div>

      {/* Profile Info */}
      {profile && (
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary shrink-0">
                {profile.name?.charAt(0)}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">সদস্য নং</p>
                    <p className="font-medium">{profile.member_no || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">নাম</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">মোবাইল</p>
                    <p className="font-medium">{profile.mobile || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">অর্থ বছর</p>
                    <p className="font-medium">{profile.financial_year || '-'}</p>
                  </div>
                </div>
              </div>
              <Badge variant={profile.is_active ? 'default' : 'secondary'} className="shrink-0">
                {profile.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">মোট জমা</p>
              <p className="text-lg font-bold">{formatCurrency(totals.deposit)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
              <Wallet className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">বর্তমান ব্যালেন্স</p>
              <p className="text-lg font-bold">{formatCurrency(totals.balance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <AlertTriangle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">মোট বকেয়া</p>
              <p className="text-lg font-bold">{formatCurrency(totals.due)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">মোট রেকর্ড</p>
              <p className="text-lg font-bold">{totals.count}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              মাসিক জমা ও বকেয়া
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deposit" fill="var(--color-deposit)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="due" fill="var(--color-due)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            মাসিক রেকর্ড
          </CardTitle>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="বছর" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব বছর</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">লোড হচ্ছে...</div>
          ) : !records?.length ? (
            <div className="p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">কোনো রেকর্ড নেই</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">মাস</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">মাসিক জমা</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground hidden sm:table-cell">বিবিধ</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground hidden sm:table-cell">জরিমানা</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">মোট</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">বকেয়া</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">ব্যালেন্স</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">রিসিট</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">{r.month_name} {r.year}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.monthly_deposit)}</td>
                      <td className="px-3 py-2.5 text-right hidden sm:table-cell">{formatCurrency(r.misc_expense)}</td>
                      <td className="px-3 py-2.5 text-right hidden sm:table-cell">{formatCurrency(r.late_fine)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.total_amount)}</td>
                      <td className="px-3 py-2.5 text-right text-accent">{formatCurrency(r.due)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.current_balance)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(r)} title="PDF ডাউনলোড">
                          <FileDown className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
