export interface UpdateProfileBody {
  name?: string
  email?: string
}

export interface UpdatePasswordBody {
  password: string
  password_confirmation: string
}
