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
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 items-center justify-center p-12 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-foreground/5 rounded-full animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-16 w-56 h-56 bg-primary-foreground/5 rounded-full animate-[pulse_8s_ease-in-out_infinite_1s]" />
          <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-primary-foreground/5 rounded-full animate-[pulse_7s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-primary-foreground/5 rounded-full animate-[pulse_5s_ease-in-out_infinite_0.5s]" />
        </div>

        <div className="relative z-10 max-w-md text-primary-foreground space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 shadow-lg">
              <span className="text-3xl font-bold">স</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">সমিতি ম্যানেজার</h1>
              <p className="text-primary-foreground/70 text-sm">সমবায় ব্যবস্থাপনা সিস্টেম</p>
            </div>
          </div>

          {/* Welcome text */}
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

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: 'সদস্য ব্যবস্থাপনা', desc: 'সকল সদস্যের তথ্য' },
              { icon: Wallet, label: 'আর্থিক হিসাব', desc: 'জমা ও খরচ ট্র্যাক' },
              { icon: TrendingUp, label: 'রিপোর্ট ও চার্ট', desc: 'বিস্তারিত বিশ্লেষণ' },
              { icon: Shield, label: 'নিরাপদ সিস্টেম', desc: 'এনক্রিপ্টেড ডেটা' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-xl bg-primary-foreground/8 backdrop-blur-sm border border-primary-foreground/10 p-3 transition-all hover:bg-primary-foreground/12"
                style={{ animationDelay: `${i * 150}ms` }}
              >
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

      {/* Right side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-6 sm:space-y-8 animate-fade-in">
          {/* Mobile logo (shown only on mobile/tablet) */}
          <div className="lg:hidden text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="relative mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">স</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">সমিতি ম্যানেজার</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">সমবায় ব্যবস্থাপনা সিস্টেম</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-border shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />
            <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">স্বাগতম! 👋</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">ইমেইল</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@somity.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium">পাসওয়ার্ড</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]" 
                  disabled={loading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
                </Button>
              </form>

              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-muted-foreground px-2">সুরক্ষিত লগইন</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>আপনার তথ্য সম্পূর্ণ এনক্রিপ্টেড ও নিরাপদ</span>
              </div>
            </CardContent>
          </Card>

          {/* Mobile features (shown only on mobile) */}
          <div className="lg:hidden grid grid-cols-2 gap-2.5">
            {[
              { icon: Users, label: 'সদস্য ব্যবস্থাপনা' },
              { icon: Wallet, label: 'আর্থিক হিসাব' },
              { icon: TrendingUp, label: 'রিপোর্ট ও চার্ট' },
              { icon: Shield, label: 'নিরাপদ সিস্টেম' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-xl bg-muted/50 p-2.5 text-xs">
                <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-muted-foreground lg:hidden">
            © {new Date().getFullYear()} সমিতি ম্যানেজার
          </p>
        </div>
      </div>
    </div>
  );
}
