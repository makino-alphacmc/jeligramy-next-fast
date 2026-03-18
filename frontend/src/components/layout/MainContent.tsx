export function MainContent({ children }: { children: React.ReactNode }) {
	return (
		<main className='min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-card'>
			{children}
		</main>
	)
}
