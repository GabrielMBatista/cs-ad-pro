import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'CS AD-PRO | GMAX Skins Creator',
    description: 'AI-powered CS:GO skin advertisement creator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Oswald:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
