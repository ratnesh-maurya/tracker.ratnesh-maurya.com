import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Personal Tracker by Ratnesh Maurya';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #0d0d1a 0%, #111127 50%, #0a0a16 100%)',
                    padding: '72px 80px',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                {/* Top decorative blobs */}
                <div style={{
                    position: 'absolute', top: -120, right: -80,
                    width: 500, height: 500,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: -80, left: -60,
                    width: 400, height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
                }} />

                {/* Logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, color: '#fff',
                    }}>
                        📊
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.3px' }}>
                        Personal Tracker
                    </span>
                </div>

                {/* Main headline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center', paddingTop: 40 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: 100, padding: '6px 18px',
                    }}>
                        <span style={{ fontSize: 14, color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.05em' }}>
                            FREE · OPEN SOURCE · NO ADS
                        </span>
                    </div>

                    <div style={{ fontSize: 68, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-2px' }}>
                        Track Everything.
                    </div>
                    <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', color: '#a78bfa' }}>
                        Build Better Habits.
                    </div>

                    <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 8, maxWidth: 640, lineHeight: 1.5 }}>
                        Habits · Sleep · Food · Study · Expenses · Journal — all in one place.
                    </div>
                </div>

                {/* Bottom — feature pills + author */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {['🔥 Streaks', '📚 Study', '😴 Sleep', '💸 Expenses'].map((f) => (
                            <div key={f} style={{
                                padding: '8px 16px', borderRadius: 100,
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                fontSize: 15, color: 'rgba(255,255,255,0.7)',
                                fontWeight: 600,
                            }}>
                                {f}
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>
                        by Ratnesh Maurya · blog.ratnesh-maurya.com
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
