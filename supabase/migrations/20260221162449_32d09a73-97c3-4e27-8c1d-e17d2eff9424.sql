
-- Create storage bucket for member photos
INSERT INTO storage.buckets (id, name, public) VALUES ('member-photos', 'member-photos', true);

-- Allow admins to upload member photos
CREATE POLICY "Admins can upload member photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos' AND public.has_role(auth.uid(), 'super_admin'));

-- Allow admins to update member photos
CREATE POLICY "Admins can update member photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'member-photos' AND public.has_role(auth.uid(), 'super_admin'));

-- Allow admins to delete member photos
CREATE POLICY "Admins can delete member photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'member-photos' AND public.has_role(auth.uid(), 'super_admin'));

-- Everyone can view member photos (public bucket)
CREATE POLICY "Anyone can view member photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');
