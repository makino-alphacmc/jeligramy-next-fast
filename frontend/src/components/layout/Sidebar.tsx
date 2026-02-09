'use client'

import Link from 'next/link'
import { fetchLogout } from '@/lib/api'

const items = [
	{ label: 'Home', href: '/' },
	{ label: 'New post', href: '/posts/new' },
	{ label: 'Profile', href: '/profile' },
	{ label: 'Drafts', href: '/drafts' },
	{ label: 'Settings', href: '/settings' },
]

export function Sidebar() {
	return (
		<aside className='w-[200px] shrink-0 rounded-lg border border-sidebar-border bg-sidebar'>
			<nav className='flex flex-col py-2'>
				{items.map(({ label, href }) => (
					<Link
						key={label}
						href={href}
						className='flex h-12 items-center px-4 text-sm font-medium text-muted-foreground hover:text-foreground'
					>
						{label}
					</Link>
				))}
				<hr className='my-2 border-sidebar-border'>
					<button
						type='button'
						className='flex h-12 w-full items-center px-4 text-left text-sm font-medium text-muted-foreground hover:text-foreground'
						onClick={async () => {
							await fetchLogout()
							window.location.href = '/'
						}}
					>
						Logout
					</button>
				</hr>
			</nav>
		</aside>
	)
}
