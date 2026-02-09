const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function fetchMe(): Promise<{
	id: string
	username: string
	avatar_url: string | null
} | null> {
	const res = await fetch(`${BASE}/api/auth/me`, { credentials: 'include' })
	if (!res.ok) return null
	return res.json()
}

export async function fetchLogout(): Promise<void> {
	// なぜ必要: ユーザーが Logout を押したときに、サーバー側でセッションを無効にする意図を伝えるため。
	await fetch(`${BASE}/api/auth/logout`, {
		method: 'POST',
		credentials: 'include',
	})
	// 意味: POST で /api/auth/logout を呼ぶ。戻り値は使わない。本番ではここで Cookie が削除される想定。
}
