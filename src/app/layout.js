import './globals.css'

export const metadata = {
  title: 'AVATAR Math｜數學學習平台',
  description: '遊戲化數學學習平台，提供個人化學習體驗',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
