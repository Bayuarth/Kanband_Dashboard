import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { TEAM_MEMBERS } from '../utils/constants';

export function fullName(user: { firstName: string; lastName: string } | null): string | undefined {
  return user ? `${user.firstName} ${user.lastName}`.trim() : undefined;
}

/** Team members + the logged in user (deduplicated). */
export function useAssignees(): string[] {
  const { user } = useAuth();
  return useMemo(() => {
    const me = fullName(user);
    return me && !TEAM_MEMBERS.includes(me) ? [me, ...TEAM_MEMBERS] : TEAM_MEMBERS;
  }, [user]);
}
