export const metadata = {
  title: 'Red Carpet Awards - Vote for Best Actress & Actor',
  description: 'Vote for your favorite Hollywood stars at the Red Carpet Awards Party',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          /* Custom scrollbar styles */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.5);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(147, 51, 234, 0.7);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(147, 51, 234, 0.9);
          }
          /* For Firefox */
          * {
            scrollbar-width: thin;
            scrollbar-color: rgba(147, 51, 234, 0.7) rgba(31, 41, 55, 0.5);
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
