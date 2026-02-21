import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMember, createRecord, updateRecord, getMemberRecords } from '@/lib/api';
import { BENGALI_MONTHS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function UpdateRecord() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('record');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: member } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMember(id!),
    enabled: !!id,
  });

  const { data: records } = useQuery({
    queryKey: ['records', id],
    queryFn: () => getMemberRecords(id!),
    enabled: !!id,
  });

  const existingRecord = records?.find(r => r.id === recordId);

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month_number: new Date().getMonth() + 1,
    date: new Date().toISOString().split('T')[0],
    monthly_deposit: 0,
    misc_expense: 0,
    late_fine: 0,
    one_time: 0,
    due: 0,
    total_deposit: 0,
    total_expense: 0,
    current_balance: 0,
  });

  useEffect(() => {
    if (existingRecord) {
      setForm({
        year: existingRecord.year,
        month_number: existingRecord.month_number,
        date: existingRecord.date || '',
        monthly_deposit: Number(existingRecord.monthly_deposit) || 0,
        misc_expense: Number(existingRecord.misc_expense) || 0,
        late_fine: Number(existingRecord.late_fine) || 0,
        one_time: Number(existingRecord.one_time) || 0,
        due: Number(existingRecord.due) || 0,
        total_deposit: Number(existingRecord.total_deposit) || 0,
        total_expense: Number(existingRecord.total_expense) || 0,
        current_balance: Number(existingRecord.current_balance) || 0,
      });
    }
  }, [existingRecord]);

  const monthName = BENGALI_MONTHS.find(m => m.number === form.month_number)?.name || '';

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (recordId && existingRecord) {
        return updateRecord(recordId, { ...form, month_name: monthName });
      } else {
        return createRecord({ member_id: id!, ...form, month_name: monthName });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', id] });
      toast({ title: 'সফল!', description: recordId ? 'রেকর্ড আপডেট হয়েছে' : 'নতুন রেকর্ড যোগ হয়েছে' });
      navigate(`/admin/members/${id}`);
    },
    onError: (err: any) => {
      toast({ title: 'ত্রুটি', description: err.message, variant: 'destructive' });
    },
  });

  const updateField = (key: string, value: number | string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const totalAmount = form.monthly_deposit + form.misc_expense + form.late_fine + form.one_time;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to={`/admin/members/${id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold truncate">{recordId ? 'রেকর্ড আপডেট' : 'নতুন মাসের রেকর্ড'}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{member?.name} — #{member?.member_no}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-3 sm:p-6 pt-3 sm:pt-6">
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4 sm:space-y-5">
            {/* Year & Month & Date */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">বছর</Label>
                <Input type="number" value={form.year} onChange={e => updateField('year', parseInt(e.target.value))} className="h-10 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">মাস</Label>
                <Select value={form.month_number.toString()} onValueChange={v => updateField('month_number', parseInt(v))}>
                  <SelectTrigger className="h-10 sm:h-9 text-xs sm:text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BENGALI_MONTHS.map(m => (
                      <SelectItem key={m.number} value={m.number.toString()}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-xs sm:text-sm">তারিখ</Label>
                <Input type="date" value={form.date} onChange={e => updateField('date', e.target.value)} className="h-10 sm:h-9 text-sm" />
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">মাসিক জমা (৳)</Label>
                <Input type="number" step="0.01" value={form.monthly_deposit} onChange={e => updateField('monthly_deposit', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">বিবিধ খরচ (৳)</Label>
                <Input type="number" step="0.01" value={form.misc_expense} onChange={e => updateField('misc_expense', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">জরিমানা (৳)</Label>
                <Input type="number" step="0.01" value={form.late_fine} onChange={e => updateField('late_fine', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">এককালীন (৳)</Label>
                <Input type="number" step="0.01" value={form.one_time} onChange={e => updateField('one_time', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
            </div>

            {/* Total */}
            <div className="rounded-lg bg-muted p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">মোট টাকা (স্বয়ংক্রিয়)</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">৳{totalAmount.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}</p>
            </div>

            {/* Running totals */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">বকেয়া (৳)</Label>
                <Input type="number" step="0.01" value={form.due} onChange={e => updateField('due', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">মোট জমা (৳)</Label>
                <Input type="number" step="0.01" value={form.total_deposit} onChange={e => updateField('total_deposit', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">মোট ব্যয় (৳)</Label>
                <Input type="number" step="0.01" value={form.total_expense} onChange={e => updateField('total_expense', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">ব্যালেন্স (৳)</Label>
                <Input type="number" step="0.01" value={form.current_balance} onChange={e => updateField('current_balance', parseFloat(e.target.value) || 0)} className="h-10 sm:h-9 text-sm" />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 sm:h-10 text-sm font-semibold" disabled={saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : recordId ? 'আপডেট করুন' : 'রেকর্ড যোগ করুন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
