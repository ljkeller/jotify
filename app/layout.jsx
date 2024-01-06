import { m_plus_2 } from '/app/ui/fonts';
import Header from '/app/ui/header';

import '/app/ui/global.css';

export const metadata = {
  title: 'scjail.io',
  description: 'The Scott County inmate library',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${m_plus_2.className}`}>
        <Header />
        {children}</body>
    </html>
  )
}
