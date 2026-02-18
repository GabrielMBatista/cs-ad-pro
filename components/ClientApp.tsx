'use client';

import dynamic from 'next/dynamic';

// Disable SSR — App uses localStorage and other browser-only APIs
const App = dynamic(() => import('../App'), { ssr: false });

export default function ClientApp() {
    return <App />;
}
