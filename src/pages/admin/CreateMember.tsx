import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMemberViaEdge } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateMember() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    member_no: '',
    mobile: '',
    financial_year: '2024-2025',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMemberViaEdge(form);
      toast({ title: 'সফল!', description: 'নতুন সদস্য তৈরি হয়েছে' });
      navigate('/admin/members');
    } catch (err: any) {
      toast({ title: 'ত্রুটি', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/members">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">নতুন সদস্য তৈরি</h1>
          <p className="text-muted-foreground">সমিতিতে নতুন সদস্য যোগ করুন</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>সদস্যের নাম *</Label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="নাম লিখুন" />
              </div>
              <div className="space-y-2">
                <Label>সদস্য নং *</Label>
                <Input value={form.member_no} onChange={e => update('member_no', e.target.value)} required placeholder="যেমন: S-001" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ইমেইল (লগইনের জন্য) *</Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="member@email.com" />
              </div>
              <div className="space-y-2">
                <Label>পাসওয়ার্ড *</Label>
                <Input type="password" value={form.password} onChange={e => update('password', e.target.value)} required placeholder="ন্যূনতম ৬ অক্ষর" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>মোবাইল নং</Label>
                <Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="01XXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>অর্থ বছর</Label>
                <Input value={form.financial_year} onChange={e => update('financial_year', e.target.value)} placeholder="2024-2025" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? 'তৈরি হচ্ছে...' : 'সদস্য তৈরি করুন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
