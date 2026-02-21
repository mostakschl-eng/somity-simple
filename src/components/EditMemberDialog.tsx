import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Hash, Calendar, Lock, Loader2 } from 'lucide-react';
import type { Profile } from '@/lib/api';

interface EditMemberDialogProps {
  member: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    member_no: '',
    mobile: '',
    financial_year: '',
    newPassword: '',
  });

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        member_no: member.member_no || '',
        mobile: member.mobile || '',
        financial_year: member.financial_year || '',
        newPassword: '',
      });
    }
  }, [member]);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!member) return;
    if (!form.name.trim()) {
      toast({ title: 'নাম দিতে হবে', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Update profile data
      await updateProfile(member.id, {
        name: form.name.trim(),
        member_no: form.member_no.trim() || null,
        mobile: form.mobile.trim() || null,
        financial_year: form.financial_year.trim() || null,
      });

      // Update password if provided
      if (form.newPassword.trim()) {
        if (form.newPassword.length < 6) {
          toast({ title: 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষর', variant: 'destructive' });
          setSaving(false);
          return;
        }
        const { error } = await supabase.functions.invoke('update-member-password', {
          body: { memberId: member.id, newPassword: form.newPassword },
        });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['member', member.id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'আপডেট হয়েছে ✓' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'ত্রুটি', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            সদস্যের তথ্য সম্পাদনা
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" /> নাম *
            </Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="সদস্যের নাম" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Hash className="h-3.5 w-3.5" /> সদস্য নং
              </Label>
              <Input value={form.member_no} onChange={e => update('member_no', e.target.value)} placeholder="S-001" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Phone className="h-3.5 w-3.5" /> মোবাইল
              </Label>
              <Input value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" /> অর্থ বছর
            </Label>
            <Input value={form.financial_year} onChange={e => update('financial_year', e.target.value)} placeholder="2024-2025" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs">
              <Lock className="h-3.5 w-3.5" /> নতুন পাসওয়ার্ড (খালি রাখলে পরিবর্তন হবে না)
            </Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={e => update('newPassword', e.target.value)}
              placeholder="নতুন পাসওয়ার্ড দিন"
              minLength={6}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
