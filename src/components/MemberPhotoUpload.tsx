import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { updateProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface MemberPhotoUploadProps {
  memberId: string;
  currentPhotoUrl: string | null;
  memberName: string;
  size?: 'sm' | 'lg';
}

export function MemberPhotoUpload({ memberId, currentPhotoUrl, memberName, size = 'lg' }: MemberPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dimensions = size === 'lg' ? 'h-20 w-20' : 'h-14 w-14';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl';

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('member-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'শুধুমাত্র ছবি আপলোড করুন', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'ছবি ২MB এর কম হতে হবে', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${memberId}/photo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const publicUrl = getPublicUrl(filePath);
      await updateProfile(memberId, { photo_url: publicUrl });

      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });

      toast({ title: 'ছবি আপলোড হয়েছে ✓' });
    } catch (err: any) {
      toast({ title: 'আপলোড ব্যর্থ', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await updateProfile(memberId, { photo_url: null });
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      toast({ title: 'ছবি মুছে ফেলা হয়েছে' });
    } catch (err: any) {
      toast({ title: 'ত্রুটি', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  return (
    <div className="relative group">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {currentPhotoUrl ? (
        <div className={`${dimensions} rounded-2xl overflow-hidden ring-2 ring-primary/20 relative`}>
          <img
            src={currentPhotoUrl}
            alt={memberName}
            className="h-full w-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
              disabled={uploading}
            >
              <Camera className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-full bg-background/80 hover:bg-destructive/80 hover:text-destructive-foreground transition-colors"
              disabled={uploading}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={`${dimensions} rounded-2xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer ring-2 ring-transparent hover:ring-primary/30`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="text-center">
              <span className={`${textSize} font-bold block`}>{memberName?.charAt(0)}</span>
              <Camera className="h-3 w-3 mx-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </button>
      )}

      {uploading && currentPhotoUrl && (
        <div className="absolute inset-0 rounded-2xl bg-background/60 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
