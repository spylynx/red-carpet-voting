export const metadata = {
  title: 'Red Carpet Awards - Vote for Best Actress & Actor',
  description: 'Vote for your favorite Hollywood stars at the Red Carpet Awards Party',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
