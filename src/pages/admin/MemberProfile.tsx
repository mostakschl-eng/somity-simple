import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMember, getMemberRecords, updateProfile, deleteRecord } from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Edit, User, Phone, Hash, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [yearFilter, setYearFilter] = useState<string>('all');

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

  if (memberLoading) return <div className="p-6 text-muted-foreground">লোড হচ্ছে...</div>;
  if (!member) return <div className="p-6 text-muted-foreground">সদস্য পাওয়া যায়নি</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/members">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">সদস্যের বিস্তারিত তথ্য</p>
        </div>
        <Button variant={member.is_active ? 'secondary' : 'default'} onClick={() => toggleActive.mutate()}>
          {member.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
        </Button>
      </div>

      {/* Profile Info */}
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">সদস্য নং</p>
              <p className="font-medium">{member.member_no || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">মোবাইল</p>
              <p className="font-medium">{member.mobile || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">অর্থ বছর</p>
              <p className="font-medium">{member.financial_year || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">স্ট্যাটাস</p>
              <Badge variant={member.is_active ? 'default' : 'secondary'}>
                {member.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">মাসিক রেকর্ড</CardTitle>
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
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                নতুন মাস
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recordsLoading ? (
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
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">এককালীন</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">মোট</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">বকেয়া</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">ব্যালেন্স</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">রিসিট</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">{r.month_name} {r.year}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.monthly_deposit)}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.misc_expense)}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.late_fine)}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(r.one_time)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.total_amount)}</td>
                      <td className="px-3 py-2.5 text-right text-accent">{formatCurrency(r.due)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(r.current_balance)}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">{r.receipt_no}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
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
    </div>
  );
}
