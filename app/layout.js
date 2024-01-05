import { m_plus_2 } from '/app/ui/fonts';

export const metadata = {
  title: 'Jotify.io',
  description: 'The Scott County inmate library',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${m_plus_2.className}`}>{children}</body>
    </html>
  )
}
