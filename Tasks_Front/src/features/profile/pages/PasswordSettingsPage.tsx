import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useProfile } from '../hooks/useProfile'
import { PasswordInput } from '@/components/ui/password-input'

export default function PasswordSettingsPage() {
  const { updatePassword, loading } = useProfile()
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()
    if (password !== confirm) return
    await updatePassword({ password, password_confirmation: confirm })
    setPassword('')
    setConfirm('')
  }

  const mismatch = Boolean(password) && Boolean(confirm) && password !== confirm

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Password</h2>
        <p className="text-sm text-muted-foreground">Set a new password</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              {mismatch && <p className="text-xs text-red-600">Passwords do not match.</p>}
            </div>

            <div className="flex items-center gap-4">
              <Button disabled={loading || mismatch}>Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
