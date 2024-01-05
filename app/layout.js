import { ibm_plex } from '/app/ui/fonts';

export const metadata = {
  title: 'Jotify.io',
  description: 'The Scott County inmate library',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${ibm_plex}`}>{children}</body>
    </html>
  )
}
