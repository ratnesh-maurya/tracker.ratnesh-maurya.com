'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface ShareCardData {
    username: string;
    name?: string;
    type: 'streak' | 'achievement' | 'study' | 'daily-goal' | 'profile';
    title: string;
    subtitle: string;
    value?: string | number;
    emoji?: string;
    color?: 'purple' | 'orange' | 'blue' | 'green' | 'indigo';
}

const PALETTE = {
    purple: { bg: ['#7c3aed', '#6d28d9'], accent: '#a78bfa', text: '#ede9fe' },
    orange: { bg: ['#ea580c', '#c2410c'], accent: '#fb923c', text: '#fff7ed' },
    blue:   { bg: ['#2563eb', '#1d4ed8'], accent: '#60a5fa', text: '#eff6ff' },
    green:  { bg: ['#059669', '#047857'], accent: '#34d399', text: '#ecfdf5' },
    indigo: { bg: ['#4f46e5', '#4338ca'], accent: '#818cf8', text: '#eef2ff' },
};

function drawCard(canvas: HTMLCanvasElement, data: ShareCardData) {
    const W = 1200, H = 630;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const pal = PALETTE[data.color || 'indigo'];

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, pal.bg[0]);
    bgGrad.addColorStop(1, pal.bg[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = pal.accent;
    ctx.beginPath(); ctx.arc(W - 80, 80, 220, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(100, H - 80, 180, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 300, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Dot grid pattern (subtle)
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    for (let x = 40; x < W; x += 40) {
        for (let y = 40; y < H; y += 40) {
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    // White card in the middle
    const cardX = 80, cardY = 90, cardW = W - 160, cardH = H - 180;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();
    ctx.restore();

    // Card border
    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Emoji / icon circle
    const emojiSize = 90;
    const emojiX = cardX + 60;
    const emojiY = cardY + cardH / 2 - emojiSize / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.arc(emojiX + emojiSize / 2, emojiY + emojiSize / 2, emojiSize / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.font = `${emojiSize * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.emoji || '🏆', emojiX + emojiSize / 2, emojiY + emojiSize / 2);

    // Main value
    const textX = emojiX + emojiSize + 50;
    const midY = cardY + cardH / 2;

    if (data.value !== undefined) {
        ctx.font = 'bold 120px -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(String(data.value), textX, midY + 20);
    }

    // Title
    ctx.font = 'bold 52px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.title, textX, data.value !== undefined ? midY + 90 : midY + 10);

    // Subtitle
    ctx.font = '36px -apple-system, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(data.subtitle, textX, data.value !== undefined ? midY + 140 : midY + 60);

    // Bottom bar — username + branding
    const barY = cardY + cardH + 14;
    ctx.font = 'bold 28px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(`@${data.name || data.username}`, cardX + 20, barY + 28);

    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('tracker.ratnesh-maurya.com', cardX + cardW - 20, barY + 28);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Lightweight confetti
function launchConfetti(container: HTMLElement) {
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const count = 80;
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 6 + Math.random() * 8;
        const x = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 1.2 + Math.random() * 1;
        el.style.cssText = `
            position:fixed; pointer-events:none; z-index:9999;
            left:${x}vw; top:-10px;
            width:${size}px; height:${size * 0.5}px;
            background:${color}; border-radius:2px;
            opacity:1;
            animation: confettiFall ${duration}s ${delay}s ease-in forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        container.appendChild(el);
        setTimeout(() => el.remove(), (duration + delay + 0.1) * 1000);
    }
}

// Inject confetti keyframes once
let confettiStyleInjected = false;
function injectConfettiStyle() {
    if (confettiStyleInjected) return;
    confettiStyleInjected = true;
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

export function useShareCard() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        injectConfettiStyle();
    }, []);

    const generateAndShare = useCallback(async (data: ShareCardData, celebrate = true) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        drawCard(canvas, data);

        if (celebrate) {
            launchConfetti(document.body);
        }

        // Try Web Share API with image
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], 'achievement.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                try {
                    await navigator.share({
                        title: data.title,
                        text: `${data.emoji || '🏆'} ${data.subtitle} — @${data.username}`,
                        files: [file],
                    });
                    return;
                } catch (e: any) {
                    if (e.name === 'AbortError') return;
                }
            }

            // Fallback: download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.username}-achievement.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }, []);

    const generatePreviewUrl = useCallback((data: ShareCardData): string => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        drawCard(canvas, data);
        return canvas.toDataURL('image/png');
    }, []);

    return { generateAndShare, generatePreviewUrl };
}
