import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Shield, Users, Wallet, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'লগইন ব্যর্থ', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[100dvh] bg-background overflow-hidden">
      {/* Desktop: Left side branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-foreground/5 rounded-full animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-16 w-56 h-56 bg-primary-foreground/5 rounded-full animate-[pulse_8s_ease-in-out_infinite_1s]" />
          <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-primary-foreground/5 rounded-full animate-[pulse_7s_ease-in-out_infinite_2s]" />
        </div>

        <div className="relative z-10 max-w-md text-primary-foreground space-y-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 shadow-lg">
              <span className="text-3xl font-bold">স</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">সমিতি ম্যানেজার</h1>
              <p className="text-primary-foreground/70 text-sm">সমবায় ব্যবস্থাপনা সিস্টেম</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold leading-snug">
              আপনার সমিতির সকল তথ্য <br />
              <span className="text-primary-foreground/80">এক জায়গায়, সহজেই</span>
            </h2>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              সদস্য ব্যবস্থাপনা, মাসিক জমা, বকেয়া হিসাব এবং আর্থিক রিপোর্ট — সবকিছু 
              একটি আধুনিক প্ল্যাটফর্মে।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: 'সদস্য ব্যবস্থাপনা', desc: 'সকল সদস্যের তথ্য' },
              { icon: Wallet, label: 'আর্থিক হিসাব', desc: 'জমা ও খরচ ট্র্যাক' },
              { icon: TrendingUp, label: 'রিপোর্ট ও চার্ট', desc: 'বিস্তারিত বিশ্লেষণ' },
              { icon: Shield, label: 'নিরাপদ সিস্টেম', desc: 'এনক্রিপ্টেড ডেটা' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-xl bg-primary-foreground/8 backdrop-blur-sm border border-primary-foreground/10 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-[10px] text-primary-foreground/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-primary-foreground/40 pt-4">
            © {new Date().getFullYear()} সমিতি ম্যানেজার — সমবায় ব্যবস্থাপনা প্ল্যাটফর্ম
          </p>
        </div>
      </div>

      {/* Desktop: Right side form */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <Card className="border-border shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">স্বাগতম! 👋</h2>
                <p className="text-sm text-muted-foreground">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email-desktop" className="text-sm font-medium">ইমেইল</Label>
                  <Input id="email-desktop" type="email" placeholder="admin@somity.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password-desktop" className="text-sm font-medium">পাসওয়ার্ড</Label>
                  <Input id="password-desktop" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 text-sm" />
                </div>
                <Button type="submit" className="w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
                </Button>
              </form>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>আপনার তথ্য সম্পূর্ণ এনক্রিপ্টেড ও নিরাপদ</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== MOBILE / TABLET LAYOUT ===== */}
      <div className="flex lg:hidden flex-col min-h-[100dvh] w-full">
        {/* Mobile Hero Top */}
        <div className="relative z-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 pt-8 pb-10 text-primary-foreground overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-foreground/5 rounded-full animate-[pulse_5s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 -left-8 w-24 h-24 bg-primary-foreground/5 rounded-full animate-[pulse_7s_ease-in-out_infinite_1s]" />

          <div className="relative z-10 text-center space-y-2 animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 shadow-lg">
              <span className="text-xl font-bold">স</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">সমিতি ম্যানেজার</h1>
              <p className="text-primary-foreground/60 text-[11px] mt-0.5">সমবায় ব্যবস্থাপনা সিস্টেম</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {[
                { icon: Users, label: 'সদস্য' },
                { icon: Wallet, label: 'হিসাব' },
                { icon: TrendingUp, label: 'রিপোর্ট' },
                { icon: Shield, label: 'নিরাপদ' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1 rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
                  <item.icon className="h-2.5 w-2.5" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Form Card */}
        <div className="relative z-10 flex-1 bg-background px-4 pb-6 -mt-6">
          <Card className="shadow-xl border-border overflow-hidden animate-fade-in">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
            <CardContent className="p-5 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">স্বাগতম! 👋</h2>
                <p className="text-xs text-muted-foreground mt-0.5">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email-mobile" className="text-xs font-medium">ইমেইল</Label>
                  <Input
                    id="email-mobile"
                    type="email"
                    placeholder="admin@somity.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 text-sm rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password-mobile" className="text-xs font-medium">পাসওয়ার্ড</Label>
                  <Input
                    id="password-mobile"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 text-sm rounded-xl"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-semibold rounded-xl shadow-md active:scale-[0.97] transition-all" 
                  disabled={loading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
                </Button>
              </form>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground">সুরক্ষিত লগইন</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>আপনার তথ্য সম্পূর্ণ এনক্রিপ্টেড ও নিরাপদ</span>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-[10px] text-muted-foreground mt-4">
            © {new Date().getFullYear()} সমিতি ম্যানেজার
          </p>
        </div>
      </div>
    </div>
  );
}
