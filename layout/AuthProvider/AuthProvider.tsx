'use client';

import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	useAuthRedirect();

	return <>{children}</>;
}
