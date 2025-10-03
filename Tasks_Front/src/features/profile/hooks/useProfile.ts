// src/features/profile/hooks/useProfile.ts
import * as React from 'react'
import { useProfileStore } from '../stores/profileStore'
import type { UpdatePasswordBody, UpdateProfileBody } from '@/types/Profile'

export const useProfile = () => {
  const me = useProfileStore(s => s.me)
  const loading = useProfileStore(s => s.loading)
  const fetchMe = useProfileStore(s => s.fetchMe)
  const saveProfile = useProfileStore(s => s.updateProfile)
  const changePassword = useProfileStore(s => s.updatePassword) // Renamed to match the store action

  React.useEffect(() => {
    if (!me) void fetchMe()
  }, [me, fetchMe])

  const saveProfileAction = React.useCallback(
    (data: UpdateProfileBody & { avatar?: File | null | undefined }) => saveProfile(data),
    [saveProfile]
  )
  const updatePassword = React.useCallback(
    (data: UpdatePasswordBody) => changePassword(data), // Change this to ensure consistency with the store
    [changePassword]
  )

  return { me, loading, fetchMe, saveProfile: saveProfileAction, updatePassword } as const
}
