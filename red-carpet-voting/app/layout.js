export const metadata = {
  title: 'Red Carpet Awards Voting',
  description: 'Vote for your favorite actress at the Red Carpet Awards Party',
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