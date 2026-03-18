import Link from 'next/link'

export function Footer() {
	return (
		<footer className='flex h-9 w-full flex-col items-center justify-center bg-black text-center text-[11px]'>
			<div className='text-[#71717a]'>© 2026 jeligramy</div>
			<div>
				<Link href='/terms' className='text-[#a1a1aa] hover:text-foreground'>
					Terms
				</Link>
				<span className='text-[#71717a]'> | </span>
				<Link href='/privacy' className='text-[#a1a1aa] hover:text-foreground'>
					Privacy
				</Link>
			</div>
		</footer>
	)
}
