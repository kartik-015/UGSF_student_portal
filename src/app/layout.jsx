import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SocketProvider } from '@/components/providers/SocketProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Student Portal - Charusat University',
  description: 'Comprehensive student management portal for Charusat University',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <SocketProvider>
              {children}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </SocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 