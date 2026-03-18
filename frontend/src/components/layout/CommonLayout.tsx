import { Breadcrumb } from './Breadcrumb'
import { Footer } from './Footer'
import { Header } from './Header'
import { MainContent } from './MainContent'
import { Sidebar } from './Sidebar'

export function CommonLayout({
	children,
	breadcrumb = [{ label: 'Home', href: '/' }, { label: 'Posts' }],
}: {
	children: React.ReactNode
	breadcrumb?: BreadcrumbItem[]
}) {
	return (
		<div className='flex min-h-screen flex-col bg-background'>
			<div className='flex min-h-[calc(100vh-36px)] flex-1'>
				<Sidebar />
				<div className='flex min-w-0 flex-1 flex-col'>
					<Header />
					<Breadcrumb items={breadcrumb} />
					<MainContent>{children}</MainContent>
				</div>
			</div>
			<Footer />
		</div>
	)
}
