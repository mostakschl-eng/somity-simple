import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMemberViaEdge } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ArrowLeft, Mail, Lock, User, Phone, Hash, Calendar, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.password.length < 6) {
      setError('পাসওয়ার্ড ন্যূনতম ৬ অক্ষর হতে হবে');
      return;
    }

    setLoading(true);
    try {
      await createMemberViaEdge(form);
      toast({ title: 'সফল! ✓', description: `${form.name} সফলভাবে যোগ হয়েছে` });
      navigate('/admin/members');
    } catch (err: any) {
      const msg = err.message || 'সদস্য তৈরি করতে সমস্যা হয়েছে';
      setError(msg);
      toast({ title: 'ত্রুটি', description: msg, variant: 'destructive' });
    }
    setLoading(false);
  };

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/admin/members">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            নতুন সদস্য তৈরি
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">সমিতিতে নতুন সদস্য যোগ করুন</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base">সদস্যের তথ্য</CardTitle>
          <CardDescription className="text-xs sm:text-sm">সদস্যের প্রোফাইল ও লগইন তথ্য দিন</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <User className="h-3.5 w-3.5" />
                  সদস্যের নাম *
                </Label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} required placeholder="নাম লিখুন" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Hash className="h-3.5 w-3.5" />
                  সদস্য নং *
                </Label>
                <Input value={form.member_no} onChange={e => update('member_no', e.target.value)} required placeholder="যেমন: S-001" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  ইমেইল (লগইনের জন্য) *
                </Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="member@email.com" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Lock className="h-3.5 w-3.5" />
                  পাসওয়ার্ড *
                </Label>
                <Input type="password" value={form.password} onChange={e => update('password', e.target.value)} required placeholder="ন্যূনতম ৬ অক্ষর" minLength={6} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Phone className="h-3.5 w-3.5" />
                  মোবাইল নং
                </Label>
                <Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="01XXXXXXXXX" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  অর্থ বছর
                </Label>
                <Input value={form.financial_year} onChange={e => update('financial_year', e.target.value)} placeholder="2024-2025" className="h-9 text-sm" />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2 h-9 sm:h-10 text-sm" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              {loading ? 'তৈরি হচ্ছে...' : 'সদস্য তৈরি করুন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
