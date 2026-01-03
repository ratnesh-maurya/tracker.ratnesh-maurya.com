'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SparklesProps {
    id?: string;
    className?: string;
    background?: string;
    minSize?: number;
    maxSize?: number;
    particleDensity?: number;
    particleColor?: string;
}

export const Sparkles = ({
    id = 'tsparticlesfull',
    className,
    background = 'transparent',
    minSize = 0.4,
    maxSize = 2,
    particleDensity = 100,
    particleColor = '#FFFFFF',
}: SparklesProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<any[]>([]);
    const animationFrameRef = useRef<number>();
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            color: string;
            canvasWidth: number;
            canvasHeight: number;

            constructor(width: number, height: number) {
                this.canvasWidth = width;
                this.canvasHeight = height;
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * (maxSize - minSize) + minSize;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random();
                this.color = particleColor;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > this.canvasWidth) this.x = 0;
                if (this.x < 0) this.x = this.canvasWidth;
                if (this.y > this.canvasHeight) this.y = 0;
                if (this.y < 0) this.y = this.canvasHeight;
            }

            updateCanvasSize(width: number, height: number) {
                this.canvasWidth = width;
                this.canvasHeight = height;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const resizeCanvas = () => {
            const { innerWidth, innerHeight } = window;
            setCanvasSize({ w: innerWidth, h: innerHeight });
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            // Update particle canvas dimensions
            particlesRef.current.forEach((particle) => {
                particle.updateCanvasSize(innerWidth, innerHeight);
            });
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create particles
        const particleCount = Math.floor((canvas.width * canvas.height) / particleDensity);
        particlesRef.current = Array.from({ length: particleCount }, () => new Particle(canvas.width, canvas.height));

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [background, minSize, maxSize, particleDensity, particleColor]);

    return (
        <canvas
            ref={canvasRef}
            id={id}
            className={cn('absolute inset-0 w-full h-full', className)}
        ></canvas>
    );
};

