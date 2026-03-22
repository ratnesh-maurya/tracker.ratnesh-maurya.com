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
        emoji: '💬',
        color: 'hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400',
        getUrl: (text: string) =>
            `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
        id: 'twitter',
        label: 'X / Twitter',
        emoji: '𝕏',
        color: 'hover:bg-sky-500/20 hover:border-sky-500/40 hover:text-sky-400',
        getUrl: (text: string) =>
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        emoji: 'in',
        color: 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400',
        getUrl: (text: string) =>
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://tracker.ratnesh-maurya.com')}&summary=${encodeURIComponent(text)}`,
    },
    {
        id: 'reddit',
        label: 'Reddit',
        emoji: '🔴',
        color: 'hover:bg-orange-500/20 hover:border-orange-500/40 hover:text-orange-400',
        getUrl: (text: string) =>
            `https://www.reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent('https://tracker.ratnesh-maurya.com')}`,
    },
    {
        id: 'download',
        label: 'Save image',
        emoji: '⬇',
        color: 'hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-400',
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
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-all">
                        Share
                    </button>
                )}
            </div>

            {open && (
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Share via</p>
                    {PLATFORMS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handlePlatform(p.id, p.getUrl as (t: string) => string)}
                            disabled={loading}
                            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm text-gray-300 border border-transparent transition-all text-left ${p.color}`}
                        >
                            <span className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
