'use client'
// 意味: このコンポーネントはクライアントで動く。useEffect や useState を使うのでサーバーでは実行できない。

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchMe } from '@/lib/api' // 意味: GET /api/auth/me を呼ぶ関数。戻り値でユーザー名を表示する。

export function Header() {
	const [user, setUser] = useState<{ username: string } | null>(null)
	// 意味: 取得したユーザーを保持。null のあいだはアイコンだけ表示する。
	useEffect(() => {
		fetchMe().then(setUser) // なんのため: マウント時に 1 回だけ API を呼び、取れたら user にセットして表示を更新する。
	}, []) // 意味: 依存配列が空なので、初回表示時にだけ実行する。

	return (
		<header className='flex h-14 items-center justify-between rounded-lg border border-border bg-card px-6'>
			<Link href='/' className='text-lg font-semibold text-foreground'>
				jeligramy
			</Link>
			<div className='flex h-8 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground'>
				{user ? (
					<span className='text-xs font-medium'>{user.username}</span>
				) : (
					'👤'
				)}
			</div>
		</header>
	)
}
