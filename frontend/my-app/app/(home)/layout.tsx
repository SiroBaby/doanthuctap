import { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Trang chủ | Shopping Mall',
  description: 'Website mua sắm trực tuyến với nhiều ưu đãi hấp dẫn',
  keywords: ['shop', 'ecommerce', 'bán hàng', 'online store', 'shopping mall', 'ưu đãi', 'khuyến mãi'],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00BCD4',
  icons: {
    icon: [
      {
        url: '/logo/logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
    apple: '/logo/logo.png',
    shortcut: '/logo/logo.png',
  },
  openGraph: {
    title: 'Trang chủ | Shopping Mall',
    description: 'Website mua sắm trực tuyến với nhiều ưu đãi hấp dẫn',
    url: 'https://shopping-mall.example.com/',
    siteName: 'Shopping Mall',
    images: [
      {
        url: '/logo/logo.png',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  }
}

interface HomeLayoutProps {
  children: ReactNode
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content container */}
      <main className="w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* Optional: Add footer */}
      <footer className="mt-auto py-6 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4">
          {/* Footer content */}
        </div>
      </footer>
    </div>
  )
}

export default HomeLayout