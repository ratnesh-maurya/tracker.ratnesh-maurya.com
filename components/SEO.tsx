'use client';

import { useEffect } from 'react';

export function SEO() {
    useEffect(() => {
        // Add additional SEO meta tags
        const metaTags = [
            { name: 'application-name', content: 'Personal Tracker' },
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'format-detection', content: 'telephone=no' },
            { name: 'geo.region', content: 'IN' },
            { name: 'language', content: 'English' },
            { name: 'revisit-after', content: '7 days' },
            { name: 'distribution', content: 'global' },
            { name: 'rating', content: 'general' },
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

