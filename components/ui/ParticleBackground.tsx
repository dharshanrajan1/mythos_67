"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    opacity: number
    hue: number
    pulse: number
    pulseSpeed: number
}

export function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationId: number
        const particles: Particle[] = []
        const PARTICLE_COUNT = 70
        const CONNECTION_DISTANCE = 130

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener("resize", resize)

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2.5 + 1,
                opacity: Math.random() * 0.6 + 0.3,
                hue: Math.random() * 80 + 220, // 220–300: blue → violet
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.02,
            })
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const isDark = resolvedTheme === "dark"

            for (const p of particles) {
                p.pulse += p.pulseSpeed
            }

            // Connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < CONNECTION_DISTANCE) {
                        const alpha = (1 - dist / CONNECTION_DISTANCE) * (isDark ? 0.2 : 0.12)
                        ctx.beginPath()
                        ctx.strokeStyle = isDark
                            ? `hsla(258, 80%, 75%, ${alpha})`
                            : `hsla(252, 65%, 50%, ${alpha})`
                        ctx.lineWidth = 1
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            // Particles
            for (const p of particles) {
                const pulsedRadius = p.radius + Math.sin(p.pulse) * 0.8
                const pulsedOpacity = p.opacity + Math.sin(p.pulse) * 0.15

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedRadius * 3)
                gradient.addColorStop(
                    0,
                    `hsla(${p.hue}, 90%, ${isDark ? 75 : 55}%, ${pulsedOpacity})`
                )
                gradient.addColorStop(
                    1,
                    `hsla(${p.hue}, 90%, ${isDark ? 75 : 55}%, 0)`
                )
                ctx.beginPath()
                ctx.fillStyle = gradient
                ctx.arc(p.x, p.y, pulsedRadius * 3, 0, Math.PI * 2)
                ctx.fill()

                p.x += p.vx
                p.y += p.vy
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1
            }

            animationId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener("resize", resize)
        }
    }, [resolvedTheme])

    return (
        <>
            {/* Animated mesh gradient layer */}
            <div
                className="fixed inset-0 -z-20 pointer-events-none"
                style={{
                    background: resolvedTheme === "dark"
                        ? `
                            radial-gradient(ellipse 80% 60% at 20% 10%, hsla(258,80%,18%,0.7) 0%, transparent 60%),
                            radial-gradient(ellipse 60% 50% at 80% 80%, hsla(190,80%,12%,0.6) 0%, transparent 55%),
                            radial-gradient(ellipse 50% 40% at 50% 50%, hsla(230,40%,10%,0.5) 0%, transparent 70%),
                            hsl(230 35% 7%)
                          `
                        : `
                            radial-gradient(ellipse 80% 60% at 20% 10%, hsla(252,80%,92%,0.8) 0%, transparent 60%),
                            radial-gradient(ellipse 60% 50% at 80% 80%, hsla(196,80%,88%,0.7) 0%, transparent 55%),
                            radial-gradient(ellipse 50% 40% at 60% 40%, hsla(280,60%,93%,0.5) 0%, transparent 70%),
                            hsl(240 20% 97%)
                          `,
                    animation: "meshShift 12s ease-in-out infinite alternate",
                }}
            />
            {/* Floating blobs that drift slowly */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
                    style={{
                        top: "-10%",
                        left: "-5%",
                        background: resolvedTheme === "dark"
                            ? "radial-gradient(circle, hsla(258,90%,60%,0.4), transparent 70%)"
                            : "radial-gradient(circle, hsla(252,80%,75%,0.4), transparent 70%)",
                        animation: "blobDrift1 18s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
                    style={{
                        bottom: "5%",
                        right: "0%",
                        background: resolvedTheme === "dark"
                            ? "radial-gradient(circle, hsla(190,90%,50%,0.35), transparent 70%)"
                            : "radial-gradient(circle, hsla(196,80%,70%,0.35), transparent 70%)",
                        animation: "blobDrift2 22s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
                    style={{
                        top: "40%",
                        left: "40%",
                        background: resolvedTheme === "dark"
                            ? "radial-gradient(circle, hsla(310,70%,50%,0.3), transparent 70%)"
                            : "radial-gradient(circle, hsla(280,70%,80%,0.3), transparent 70%)",
                        animation: "blobDrift3 25s ease-in-out infinite",
                    }}
                />
            </div>

            {/* Canvas particles */}
            <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />

            <style>{`
                @keyframes meshShift {
                    0%   { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                @keyframes blobDrift1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33%      { transform: translate(60px, 40px) scale(1.1); }
                    66%      { transform: translate(-30px, 70px) scale(0.95); }
                }
                @keyframes blobDrift2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    40%      { transform: translate(-70px, -50px) scale(1.15); }
                    70%      { transform: translate(40px, -30px) scale(0.9); }
                }
                @keyframes blobDrift3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%      { transform: translate(-50px, 60px) scale(1.2); }
                }
            `}</style>
        </>
    )
}
