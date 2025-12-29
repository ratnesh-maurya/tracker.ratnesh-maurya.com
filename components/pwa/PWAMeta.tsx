'use client';

import { useEffect } from 'react';

export function PWAMeta() {
    useEffect(() => {
        // Add PWA meta tags dynamically
        const metaTags = [
            { name: 'theme-color', content: '#3B82F6' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
            { name: 'apple-mobile-web-app-title', content: 'Personal Tracker' },
        ];

        metaTags.forEach((tag) => {
            let element = document.querySelector(`meta[name="${tag.name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('name', tag.name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', tag.content);
        });
    }, []);

    return null;
}

