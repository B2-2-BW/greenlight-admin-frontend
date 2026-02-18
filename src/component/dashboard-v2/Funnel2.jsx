import React, { useEffect, useLayoutEffect, useRef } from 'react';

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function degToRad(d) {
  return (d * Math.PI) / 180;
}

export default function Funnel2({
  className = '',
  emitSignal,

  // 4) 발사 제어
  quantity = 1,
  duration = 1.0, // seconds
  delay = 0.1, // seconds

  // 3) 경로
  straight = true,
  angle = 30, // degrees (0 => vertical)

  // 6) 파티클 스타일/속도
  size = { min: 2, max: 4 },
  speed = { min: 2, max: 5 },
  colors = ['#3b82f6'],

  // 2) destroy: 상대적 y 지점
  destroyYRatio = 0.95,

  // 위치
  emitterXRatio = 0.5,
  emitterY = 0,
  emitWidth = 0, // 0 = 한 점, 100 = 캔버스 전체 너비에서 랜덤

  // Funnel 연동용
  onDestroy,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const ctxRef = useRef(null);
  const dprRef = useRef(1);
  const boundsRef = useRef({ w: 0, h: 0 });

  const particlesRef = useRef([]);
  const emitJobsRef = useRef([]);
  const rafRef = useRef(0);

  const optionsRef = useRef({
    quantity,
    duration,
    delay,
    straight,
    angle,
    size,
    speed,
    colors,
    destroyYRatio,
    emitterXRatio,
    emitterY,
    emitWidth,
    onDestroy,
  });
  optionsRef.current = {
    quantity,
    duration,
    delay,
    straight,
    angle,
    size,
    speed,
    colors,
    destroyYRatio,
    emitterXRatio,
    emitterY,
    emitWidth,
    onDestroy,
  };

  // 1) 부모 너비/높이 따라 캔버스 동적 리사이즈
  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    const ro = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        const entry = entries[0];
        const w = Math.max(1, Math.floor(entry.contentRect.width));
        const h = Math.max(1, Math.floor(entry.contentRect.height));

        const dpr = window.devicePixelRatio || 1;
        dprRef.current = dpr;
        boundsRef.current = { w, h };

        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // emitSignal이 바뀔 때마다 발사 스케줄 추가
  useEffect(() => {
    if (emitSignal == null) return;

    const now = performance.now();
    const { duration, delay, quantity } = optionsRef.current;

    emitJobsRef.current.push({
      nextAt: now,
      endAt: now + duration * 1000,
      delayMs: Math.max(0, delay * 1000),
      quantity: Math.max(0, quantity),
    });
  }, [emitSignal]);

  // 메인 루프
  useEffect(() => {
    const tick = (t) => {
      const ctx = ctxRef.current;
      const { w, h } = boundsRef.current;
      if (ctx && w > 0 && h > 0) {
        const { straight, angle, size, speed, colors, destroyYRatio, emitterXRatio, emitterY, emitWidth, onDestroy } =
          optionsRef.current;

        const destroyY = h * destroyYRatio;
        const centerX = w * emitterXRatio;

        // emitWidth 계산: 0이면 한 점, 100이면 전체 너비
        const spreadW = (w * Math.min(100, Math.max(0, emitWidth))) / 100;

        // 발사 스케줄 처리
        if (emitJobsRef.current.length > 0) {
          const aliveJobs = [];
          for (const job of emitJobsRef.current) {
            if (t > job.endAt) continue;

            const safeDelay = Math.max(1, job.delayMs);

            while (t >= job.nextAt && job.nextAt <= job.endAt) {
              for (let i = 0; i < job.quantity; i++) {
                const spd = rand(speed.min, speed.max);
                let vx = 0;
                let vy = spd;

                if (!straight) {
                  const spread = Math.max(0, angle);
                  const half = spread / 2;
                  const theta = degToRad(90 + rand(-half, half));
                  vx = Math.cos(theta) * spd;
                  vy = Math.sin(theta) * spd;
                }

                // emitWidth만큼 좌우로 랜덤 분산
                const startX = spreadW === 0 ? centerX : centerX + rand(-spreadW / 2, spreadW / 2);

                particlesRef.current.push({
                  x: startX,
                  y: emitterY,
                  vx,
                  vy,
                  r: rand(size.min, size.max),
                  color: pick(colors),
                });
              }
              job.nextAt += safeDelay;
            }

            aliveJobs.push(job);
          }
          emitJobsRef.current = aliveJobs;
        }

        // clear & draw
        ctx.clearRect(0, 0, w, h);

        let destroyed = 0;
        const nextParticles = [];

        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y >= destroyY) {
            destroyed++;
            continue;
          }

          if (p.x < -50 || p.x > w + 50 || p.y < -50) continue;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          nextParticles.push(p);
        }

        particlesRef.current = nextParticles;

        if (destroyed > 0 && typeof onDestroy === 'function') {
          onDestroy(destroyed);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
}
