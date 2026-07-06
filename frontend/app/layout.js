import './globals.css';

export const metadata = {
  title: 'ShubhYatra | AI Tourist Safety',
  description: 'AI-powered tourist safety platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
