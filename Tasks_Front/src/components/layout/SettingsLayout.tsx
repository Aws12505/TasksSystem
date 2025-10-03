import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'

const sidebarNav = [
  { title: 'Profile', href: '/settings' },
  { title: 'Password', href: '/settings/password' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="px-4 py-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
      </div>

      <div className="mt-6 flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav className="flex flex-col space-y-1">
            {sidebarNav.map((item) => (
              <Button
                key={item.href}
                size="sm"
                variant="ghost"
                asChild
                className={cn('w-full justify-start', { 'bg-muted': pathname === item.href })}
              >
                <Link to={item.href}>{item.title}</Link>
              </Button>
            ))}
          </nav>
        </aside>

        <Separator className="my-6 md:hidden" />

        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-12">{children}</section>
        </div>
      </div>
    </div>
  )
}
