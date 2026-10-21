import { useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Upload, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminUploadTemplateCover } from '@/lib/admin.functions';
import { validateTemplatePhoto } from '@/lib/template-upload';
import { toast } from 'sonner';

export function AdminTemplatePhoto({ id, title, onSaved }: { id: string; title: string; onSaved: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = useServerFn(adminUploadTemplateCover);
  return <>
    <input ref={input} type="file" className="hidden" aria-label={`Update photo for ${title}`} accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={async event => {
      const photo = event.target.files?.[0];
      if (!photo) return;
      try {
        validateTemplatePhoto(photo.type, photo.size);
        setBusy(true);
        const data = new FormData(); data.set('id', id); data.set('photo', photo);
        await upload({ data }); onSaved(); toast.success('Template photo updated');
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Photo could not be saved'); }
      finally { setBusy(false); if (input.current) input.current.value = ''; }
    }} />
    <Button variant="outline" size="sm" className="mt-3" disabled={busy} onClick={() => input.current?.click()}>{busy ? <LoaderCircle className="animate-spin" /> : <Upload />} {busy ? 'Uploading…' : 'Update photo'}</Button>
  </>;
}