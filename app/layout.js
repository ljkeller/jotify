export const metadata = {
  title: 'Jotify.io',
  description: 'The Scott County inmate library',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
