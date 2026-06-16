import './globals.css'

export const metadata = {
  title: 'ZeropageMD',
  description: 'Markdown to PDF Studio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
