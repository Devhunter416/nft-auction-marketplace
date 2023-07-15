import Navbar from '@/components/navbar'
import Providers from './_providers/providers'
import './globals.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'Nft Marketplace',
  description: 'Nft Marketplace',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en">
      <body>
        <Providers>
        <ToastContainer position="top-center"/>
        <Navbar />
        
          {children}
          </Providers>
      </body>
    </html>
  )
}