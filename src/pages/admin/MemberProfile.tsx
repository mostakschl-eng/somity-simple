import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMember, getMemberRecords, updateProfile, deleteRecord } from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { generateReceiptPDF } from '@/lib/generateReceipt';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Plus, Trash2, Edit, User, Phone, Hash, Calendar,
  Wallet, TrendingUp, AlertTriangle, Activity, Receipt, FileDown
} from 'lucide-react';
import { MemberPhotoUpload } from '@/components/MemberPhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { EditMemberDialog } from '@/components/EditMemberDialog';
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

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [editOpen, setEditOpen] = useState(false);

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMember(id!),
    enabled: !!id,
  });

  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['records', id, yearFilter],
    queryFn: () => getMemberRecords(id!, yearFilter !== 'all' ? parseInt(yearFilter) : undefined),
    enabled: !!id,
  });

  const toggleActive = useMutation({
    mutationFn: () => updateProfile(id!, { is_active: !member?.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'আপডেট হয়েছে' });
    },
  });

  const deleteRec = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', id] });
      toast({ title: 'রেকর্ড মুছে ফেলা হয়েছে' });
    },
  });

  const years = [...new Set(records?.map(r => r.year))].sort((a, b) => b - a);

  // Financial summary
  const summary = useMemo(() => {
    if (!records?.length) return { deposit: 0, expense: 0, due: 0, balance: 0 };
    const last = records[records.length - 1];
    return {
      deposit: Number(last.total_deposit) || 0,
      expense: Number(last.total_expense) || 0,
      due: records.reduce((s, r) => s + (Number(r.due) || 0), 0),
      balance: Number(last.current_balance) || 0,
    };
  }, [records]);

  const chartData = useMemo(() => {
    if (!records) return [];
    return records.map(r => ({
      name: `${r.month_name?.substring(0, 3)}`,
      deposit: Number(r.monthly_deposit) || 0,
      due: Number(r.due) || 0,
    }));
  }, [records]);

  if (memberLoading) return <div className="p-6 text-muted-foreground">লোড হচ্ছে...</div>;
  if (!member) return <div className="p-6 text-muted-foreground">সদস্য পাওয়া যায়নি</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/admin/members">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold truncate">{member.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">সদস্যের বিস্তারিত তথ্য</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" onClick={() => setEditOpen(true)}>
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">সম্পাদনা</span>
          </Button>
          <Button variant={member.is_active ? 'secondary' : 'default'} size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" onClick={() => toggleActive.mutate()}>
            {member.is_active ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <Card>
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <MemberPhotoUpload
              memberId={id!}
              currentPhotoUrl={member.photo_url}
              memberName={member.name}
              size="sm"
            />
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">সদস্য নং</p>
                  <p className="text-sm font-medium truncate">{member.member_no || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">মোবাইল</p>
                  <p className="text-sm font-medium truncate">{member.mobile || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">অর্থ বছর</p>
                  <p className="text-sm font-medium truncate">{member.financial_year || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">স্ট্যাটাস</p>
                  <Badge variant={member.is_active ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                    {member.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-success/10 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">মোট জমা</p>
              <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(summary.deposit)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-info/10 shrink-0">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">ব্যালেন্স</p>
              <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(summary.balance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">মোট বকেয়া</p>
              <p className="text-sm sm:text-lg font-bold truncate">{formatCurrency(summary.due)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">মোট রেকর্ড</p>
              <p className="text-sm sm:text-lg font-bold">{records?.length ?? 0}</p>
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

      {/* Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            মাসিক রেকর্ড
          </CardTitle>
          <div className="flex items-center gap-3">
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
            <Link to={`/admin/members/${id}/update`}>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                নতুন মাস
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recordsLoading ? (
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
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground hidden md:table-cell">এককালীন</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">মোট</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">বকেয়া</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">ব্যালেন্স</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground hidden sm:table-cell">রিসিট</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">{r.month_name} {r.year}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.monthly_deposit)}</td>
                      <td className="px-3 py-2.5 text-right hidden sm:table-cell">{formatCurrency(r.misc_expense)}</td>
                      <td className="px-3 py-2.5 text-right hidden sm:table-cell">{formatCurrency(r.late_fine)}</td>
                      <td className="px-3 py-2.5 text-right hidden md:table-cell">{formatCurrency(r.one_time)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.total_amount)}</td>
                      <td className="px-3 py-2.5 text-right text-accent">{formatCurrency(r.due)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.current_balance)}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-muted-foreground hidden sm:table-cell">{r.receipt_no}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="sm" onClick={() => member && generateReceiptPDF(r, member)} title="PDF ডাউনলোড">
                            <FileDown className="h-3.5 w-3.5" />
                          </Button>
                          <Link to={`/admin/members/${id}/update?record=${r.id}`}>
                            <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                          </Link>
                          <Button 
                            variant="ghost" size="sm" 
                            onClick={() => { if (confirm('মুছে ফেলতে চান?')) deleteRec.mutate(r.id); }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditMemberDialog member={member} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
