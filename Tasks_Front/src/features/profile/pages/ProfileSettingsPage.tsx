import * as React from 'react'
import { useProfile } from '../hooks/useProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ProfileSettingsPage() {
  const { me, loading, saveProfile } = useProfile()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (me) {
      setName(me.name)
      setEmail(me.email)
      setPreview(me.avatar_url || null)
    }
  }, [me])

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null
    setAvatarFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(me?.avatar_url || null)
    }
  }

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()
    const updated = await saveProfile({ name, email, avatar: avatarFile || undefined })
    if (updated) {
      if (avatarFile) URL.revokeObjectURL(preview || '')
      toast.success('Saved')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile information</h2>
        <p className="text-sm text-muted-foreground">Update your name, email, and photo</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar">Photo</Label>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-muted">
                  {preview && (
                    <img src={preview} alt="avatar preview" className="h-full w-full object-cover" />
                  )}
                </div>
                <Input id="avatar" type="file" accept="image/*" onChange={onPickFile} className="max-w-xs" />
              </div>
              <p className="text-xs text-muted-foreground">JPG/PNG/WebP, up to 2MB.</p>
            </div>

            <div className="flex items-center gap-4">
              <Button disabled={loading}>Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
