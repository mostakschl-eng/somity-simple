import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getMemberRecords, getMember } from '@/lib/api';
import { formatCurrency, BENGALI_MONTHS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, User, Phone, Hash, Calendar } from 'lucide-react';
import { useState, useRef } from 'react';

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

  const handleDownloadReceipt = (record: any) => {
    // Simple text-based receipt
    const receiptContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        সমিতি ম্যানেজার
         মাসিক রিসিট
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

রিসিট নং: ${record.receipt_no}
তারিখ: ${record.date || '-'}

সদস্যের নাম: ${profile?.name}
সদস্য নং: ${profile?.member_no}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
মাস: ${record.month_name} ${record.year}

মাসিক জমা:      ৳${record.monthly_deposit}
বিবিধ খরচ:      ৳${record.misc_expense}
বিলম্ব জরিমানা:  ৳${record.late_fine}
এককালীন:        ৳${record.one_time}
─────────────────────────────
মোট টাকা:       ৳${record.total_amount}

বকেয়া:          ৳${record.due}
মোট জমা:        ৳${record.total_deposit}
বর্তমান ব্যালেন্স: ৳${record.current_balance}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${record.receipt_no}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">আমার প্রোফাইল</h1>
        <p className="text-muted-foreground">আপনার সমিতির তথ্য</p>
      </div>

      {/* Profile Info */}
      {profile && (
        <Card>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">সদস্য নং</p>
                <p className="font-medium">{profile.member_no || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">নাম</p>
                <p className="font-medium">{profile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">মোবাইল</p>
                <p className="font-medium">{profile.mobile || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">অর্থ বছর</p>
                <p className="font-medium">{profile.financial_year || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">মাসিক রেকর্ড</CardTitle>
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
            <div className="p-6 text-center text-muted-foreground">কোনো রেকর্ড নেই</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">মাস</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">মাসিক জমা</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">বিবিধ</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">জরিমানা</th>
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
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.misc_expense)}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.late_fine)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.total_amount)}</td>
                      <td className="px-3 py-2.5 text-right text-accent">{formatCurrency(r.due)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.current_balance)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(r)}>
                          <Download className="h-3.5 w-3.5" />
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
