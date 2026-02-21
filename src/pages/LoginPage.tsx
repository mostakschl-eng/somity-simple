import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

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
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm sm:max-w-md border-border shadow-xl">
        <CardHeader className="space-y-2.5 sm:space-y-3 text-center pb-2">
          <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl sm:text-2xl font-bold text-primary-foreground">স</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">সমিতি ম্যানেজার</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@somity.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <Button type="submit" className="w-full h-9 sm:h-10 text-sm" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
