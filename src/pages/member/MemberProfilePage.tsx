import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getMemberRecords, getMember } from '@/lib/api';
import { formatCurrency, BENGALI_MONTHS } from '@/lib/constants';
import { generateReceiptPDF } from '@/lib/generateReceipt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, Phone, Hash, Calendar, Wallet, 
  TrendingUp, AlertTriangle, Receipt, Activity, FileDown,
  CreditCard, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { useState, useMemo } from 'react';
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
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: () => getMember(user!.id),
    enabled: !!user,
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['my-records', user?.id],
    queryFn: () => getMemberRecords(user!.id),
    enabled: !!user,
  });

  const years = [...new Set(records?.map(r => r.year))].sort((a, b) => b - a);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    let filtered = records;
    if (yearFilter !== 'all') filtered = filtered.filter(r => r.year === parseInt(yearFilter));
    if (monthFilter !== 'all') filtered = filtered.filter(r => r.month_number === parseInt(monthFilter));
    return filtered;
  }, [records, yearFilter, monthFilter]);

  const totals = useMemo(() => {
    if (!filteredRecords?.length) return { deposit: 0, expense: 0, due: 0, balance: 0, count: 0, lateFine: 0, oneTime: 0 };
    return {
      deposit: filteredRecords.reduce((s, r) => s + (Number(r.total_deposit) || 0), 0),
      expense: filteredRecords.reduce((s, r) => s + (Number(r.total_expense) || 0), 0),
      due: filteredRecords.reduce((s, r) => s + (Number(r.due) || 0), 0),
      balance: filteredRecords.reduce((s, r) => s + (Number(r.current_balance) || 0), 0),
      count: filteredRecords.length,
      lateFine: filteredRecords.reduce((s, r) => s + (Number(r.late_fine) || 0), 0),
      oneTime: filteredRecords.reduce((s, r) => s + (Number(r.one_time) || 0), 0),
    };
  }, [filteredRecords]);

  const chartData = useMemo(() => {
    if (!filteredRecords) return [];
    return filteredRecords.map(r => ({
      name: `${r.month_name?.substring(0, 3)}`,
      deposit: Number(r.monthly_deposit) || 0,
      due: Number(r.due) || 0,
    }));
  }, [filteredRecords]);

  const lastRecord = filteredRecords?.[filteredRecords.length - 1];

  const handleDownloadReceipt = (record: any) => {
    if (!profile) return;
    generateReceiptPDF(record, profile);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            স্বাগতম, {profile?.name || '...'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">আপনার সমিতির ড্যাশবোর্ড ও আর্থিক সারসংক্ষেপ</p>
        </div>
        <Badge variant={profile?.is_active ? 'default' : 'secondary'} className="self-start text-xs gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${profile?.is_active ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          {profile?.is_active ? 'সক্রিয় সদস্য' : 'নিষ্ক্রিয়'}
        </Badge>
      </div>

      {/* Profile Card */}
      {profile && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {profile.photo_url ? (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-md shrink-0">
                  <img src={profile.photo_url} alt={profile.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-primary text-2xl sm:text-3xl font-bold text-primary-foreground shadow-md shrink-0">
                  {profile.name?.charAt(0)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1 w-full">
                <div className="flex items-center gap-2 bg-card/60 rounded-xl p-2.5 sm:p-3">
                  <Hash className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">সদস্য নং</p>
                    <p className="text-sm font-semibold truncate">{profile.member_no || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-card/60 rounded-xl p-2.5 sm:p-3">
                  <User className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">নাম</p>
                    <p className="text-sm font-semibold truncate">{profile.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-card/60 rounded-xl p-2.5 sm:p-3">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">মোবাইল</p>
                    <p className="text-sm font-semibold truncate">{profile.mobile || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-card/60 rounded-xl p-2.5 sm:p-3">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">অর্থ বছর</p>
                    <p className="text-sm font-semibold truncate">{profile.financial_year || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">মোট জমা</p>
              <ArrowUpRight className="h-3.5 w-3.5 text-success" />
            </div>
            <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(totals.deposit)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">ব্যালেন্স</p>
              <Wallet className="h-3.5 w-3.5 text-info" />
            </div>
            <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(totals.balance)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">মোট বকেয়া</p>
              <ArrowDownRight className="h-3.5 w-3.5 text-warning" />
            </div>
            <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(totals.due)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">মোট খরচ</p>
              <CreditCard className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(totals.expense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Extra stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">মোট রেকর্ড</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">{totals.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">জরিমানা</p>
            <p className="text-lg sm:text-2xl font-bold text-destructive">{formatCurrency(totals.lateFine)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">এককালীন</p>
            <p className="text-lg sm:text-2xl font-bold text-info">{formatCurrency(totals.oneTime)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              মাসিক জমা ও বকেয়া
            </CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-6">
            <ChartContainer config={chartConfig} className="h-[160px] sm:h-[200px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deposit" fill="var(--color-deposit)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="due" fill="var(--color-due)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Records with filters */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pb-3">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              মাসিক রেকর্ড
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-24 sm:w-28 h-8 text-xs sm:text-sm">
                  <SelectValue placeholder="বছর" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব বছর</SelectItem>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-28 sm:w-32 h-8 text-xs sm:text-sm">
                  <SelectValue placeholder="মাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব মাস</SelectItem>
                  {BENGALI_MONTHS.map(m => (
                    <SelectItem key={m.number} value={m.number.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(yearFilter !== 'all' || monthFilter !== 'all') && (
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => { setYearFilter('all'); setMonthFilter('all'); }}>
                  রিসেট
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">লোড হচ্ছে...</div>
          ) : !filteredRecords?.length ? (
            <div className="p-6 text-center">
              <Receipt className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">কোনো রেকর্ড নেই</p>
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="space-y-2 p-3 sm:hidden">
                {filteredRecords.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border p-3 space-y-2 bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm">{r.month_name} {r.year}</span>
                        {r.receipt_no && <p className="text-[10px] text-muted-foreground">রিসিট: {r.receipt_no}</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleDownloadReceipt(r)}>
                        <FileDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <span className="text-muted-foreground block text-[10px]">জমা</span>
                        <span className="font-semibold">{formatCurrency(r.monthly_deposit)}</span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <span className="text-muted-foreground block text-[10px]">মোট</span>
                        <span className="font-bold">{formatCurrency(r.total_amount)}</span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <span className="text-muted-foreground block text-[10px]">বকেয়া</span>
                        <span className="font-semibold text-warning">{formatCurrency(r.due)}</span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <span className="text-muted-foreground block text-[10px]">ব্যালেন্স</span>
                        <span className="font-bold text-primary">{formatCurrency(r.current_balance)}</span>
                      </div>
                    </div>
                    {(Number(r.late_fine) > 0 || Number(r.misc_expense) > 0) && (
                      <div className="flex gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border">
                        {Number(r.late_fine) > 0 && <span>জরিমানা: {formatCurrency(r.late_fine)}</span>}
                        {Number(r.misc_expense) > 0 && <span>বিবিধ: {formatCurrency(r.misc_expense)}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">মাস</th>
                      <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">মাসিক জমা</th>
                      <th className="px-3 py-2.5 text-right font-medium text-muted-foreground hidden md:table-cell">বিবিধ</th>
                      <th className="px-3 py-2.5 text-right font-medium text-muted-foreground hidden md:table-cell">জরিমানা</th>
                      <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">মোট</th>
                      <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">বকেয়া</th>
                      <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">ব্যালেন্স</th>
                      <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">রিসিট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-medium">{r.month_name} {r.year}</td>
                        <td className="px-3 py-2.5 text-right">{formatCurrency(r.monthly_deposit)}</td>
                        <td className="px-3 py-2.5 text-right hidden md:table-cell">{formatCurrency(r.misc_expense)}</td>
                        <td className="px-3 py-2.5 text-right hidden md:table-cell">{formatCurrency(r.late_fine)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.total_amount)}</td>
                        <td className="px-3 py-2.5 text-right text-warning">{formatCurrency(r.due)}</td>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
