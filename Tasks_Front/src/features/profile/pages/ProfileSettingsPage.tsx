import * as React from 'react'
import { useProfile } from '../hooks/useProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import clsx from 'clsx'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // 5 MB
const emailRegex =
  // simple & practical email validation (not overly strict)
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ProfileSettingsPage() {
  const { me, loading, saveProfile } = useProfile()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  // validation state
  const [nameErr, setNameErr] = React.useState<string | null>(null)
  const [emailErr, setEmailErr] = React.useState<string | null>(null)
  const [avatarErr, setAvatarErr] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (me) {
      setName(me.name)
      setEmail(me.email)
      setPreview(me.avatar_url || null)
      setNameErr(null)
      setEmailErr(null)
      setAvatarErr(null)
    }
    // cleanup object URL on unmount
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me])

  const validateName = (val: string) => {
    if (!val || val.trim().length < 3) {
      setNameErr('Name must be at least 3 characters.')
      return false
    }
    setNameErr(null)
    return true
  }

  const validateEmail = (val: string) => {
    if (!emailRegex.test(val)) {
      setEmailErr('Please enter a valid email address.')
      return false
    }
    setEmailErr(null)
    return true
  }

  const validateAvatar = (file: File | null) => {
    if (!file) {
      setAvatarErr(null)
      return true
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarErr('Image must be 5 MB or smaller.')
      return false
    }
    setAvatarErr(null)
    return true
  }

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null

    // revoke the old preview URL if any before creating a new one
    if (preview) URL.revokeObjectURL(preview)

    if (!validateAvatar(file)) {
      setAvatarFile(null)
      setPreview(me?.avatar_url || null)
      toast.error('Image must be 5 MB or smaller.')
      // reset the input so the same file can be re-picked after change
      e.currentTarget.value = ''
      return
    }

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

    // run all validations
    const okName = validateName(name)
    const okEmail = validateEmail(email)
    const okAvatar = validateAvatar(avatarFile)

    if (!okName || !okEmail || !okAvatar) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    const updated = await saveProfile({ name: name.trim(), email: email.trim(), avatar: avatarFile || undefined })
    if (updated) {
      if (avatarFile && preview) URL.revokeObjectURL(preview)
      toast.success('Saved')
    }
  }

  const isFormInvalid = !!nameErr || !!emailErr || !!avatarErr || !name || !email

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile information</h2>
        <p className="text-sm text-muted-foreground">Update your name, email, and photo</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameErr) validateName(e.target.value)
                }}
                onBlur={(e) => validateName(e.target.value)}
                required
                aria-invalid={!!nameErr}
                className={clsx(nameErr && 'border-destructive')}
              />
              {nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailErr) validateEmail(e.target.value)
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                required
                aria-invalid={!!emailErr}
                className={clsx(emailErr && 'border-destructive')}
              />
              {emailErr && <p className="text-xs text-destructive">{emailErr}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar">Photo</Label>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-muted">
                  {preview && (
                    <img src={preview} alt="avatar preview" className="h-full w-full object-cover" />
                  )}
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className={clsx('max-w-xs', avatarErr && 'border-destructive')}
                  aria-invalid={!!avatarErr}
                />
              </div>
              <p className="text-xs text-muted-foreground">JPG/PNG/WebP, up to 5MB.</p>
              {avatarErr && <p className="text-xs text-destructive">{avatarErr}</p>}
            </div>

            <div className="flex items-center gap-4">
              <Button disabled={loading || isFormInvalid}>Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
