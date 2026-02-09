'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchMe } from '@/lib/api'

const [user, setUser] = useState<{ username: string } | null>(null)

useEffect(() => {
	fetchMe().then(setUser)
}, [])

return (
	<header classname='flex h-14 items-center justify-between rounded-lg border border-border bg-card px-6'>
		<Link href='/' classname='text-lg font-semibold text-foreground'>
			jeligramy
		</Link>
		<div classname='flex h-8 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground'>
			{user ? (
				<span classname='text-xs font-medium'>{user.username}</span>
			) : (
				'👤'
			)}
		</div>
	</header>
)
