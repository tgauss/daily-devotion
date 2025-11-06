'use client'

import { User } from '@/lib/types/database'

interface UsersListProps {
  users: User[]
}

export function UsersList({ users }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-charcoal/60 font-sans">
        No users found
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 bg-sandstone/30 rounded-md border border-clay-rose/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-charcoal font-sans">
                {user.first_name || user.last_name
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : 'No name set'}
              </div>
              <div className="text-sm text-charcoal/70 font-sans mt-1">
                {user.email}
              </div>
              {user.phone_number && (
                <div className="text-xs text-charcoal/50 font-sans mt-1">
                  {user.phone_number}
                </div>
              )}
            </div>
            <div className="text-xs text-charcoal/40 font-sans">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
