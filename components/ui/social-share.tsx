'use client';

import { useState, useRef, useEffect } from 'react';
import { useShareCard, ShareCardData } from '@/components/ui/share-card';

interface SocialShareProps {
    data: ShareCardData;
    trigger?: React.ReactNode;
}

const PLATFORMS = [
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        emoji: 'wa',
        getUrl: (text: string) =>
            `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
        id: 'twitter',
        label: 'X / Twitter',
        emoji: '𝕏',
        getUrl: (text: string) =>
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        emoji: 'in',
        getUrl: (text: string) =>
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://tracker.ratnesh-maurya.com')}&summary=${encodeURIComponent(text)}`,
    },
    {
        id: 'reddit',
        label: 'Reddit',
        emoji: 'r/',
        getUrl: (text: string) =>
            `https://www.reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent('https://tracker.ratnesh-maurya.com')}`,
    },
    {
        id: 'download',
        label: 'Save image',
        emoji: '↓',
        getUrl: () => '',
    },
] as const;

export function SocialShare({ data, trigger }: SocialShareProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { generateAndShare, generatePreviewUrl } = useShareCard();

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const shareText = `${data.emoji || '🏆'} ${data.title} — ${data.subtitle}\n\nTracked on tracker.ratnesh-maurya.com @${data.username}`;

    const handlePlatform = async (id: typeof PLATFORMS[number]['id'], getUrl: (t: string) => string) => {
        setLoading(true);
        if (id === 'download') {
            await generateAndShare(data, true);
        } else {
            // Generate card image first, then open platform
            generatePreviewUrl(data); // draws to canvas (side effect for download)
            window.open(getUrl(shareText), '_blank', 'noopener,noreferrer');
        }
        setLoading(false);
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen((v) => !v)}>
                {trigger ?? (
                    <button className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-input bg-card px-5 text-sm font-medium text-foreground transition-colors duration-150 hover:border-rule">
                        Share ↗
                    </button>
                )}
            </div>

            {open && (
                <div className="saffron-hairline absolute right-0 bottom-full z-50 mb-2 w-60 animate-fade-in rounded-inner border border-border bg-popover p-2 shadow-pop">
                    <p className="eyebrow px-3 pb-1 pt-2">Share via</p>
                    {PLATFORMS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handlePlatform(p.id, p.getUrl as (t: string) => string)}
                            disabled={loading}
                            className="flex min-h-[44px] w-full items-center gap-3 rounded-full px-3 text-left text-sm text-foreground transition-colors duration-150 hover:bg-hover disabled:opacity-50"
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] text-muted-foreground">
                                {p.emoji}
                            </span>
                            {p.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
