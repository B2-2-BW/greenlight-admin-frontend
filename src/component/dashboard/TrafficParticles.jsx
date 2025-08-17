import React, { useEffect, useRef, useState } from 'react';

/**
 * 단일 카운트 기반 파티클 렌더러
 * props:
 *  - width, height: canvas size
 *  - yMin, yMax: 파티클 생기는 Y 범위(px, canvas 좌표)
 *  - count: 초당 방출량(외부에서 세팅)
 *  - particleColor: 색상
 *  - baseSpeed, speedJitter, size, maxParticles: 튜닝
 *  - smoothSpawn: 분산 방출 on/off
 *  - randomizeSpawn: 분산 방출에 약간의 랜덤성
 *  - trailAlpha: 잔상 강도(0=잔상 없음, 0.1~0.2 권장)
 *  - backgroundColor: 페이드용 배경색(캔버스 배경과 동일하게)
 */
export function TrafficParticles({
  actionGroupId = '',
  updateTrigger,
  width,
  height,
  yMin,
  yMax,
  count = 0, // 초당 방출량(외부에서 set)
  particleColor = '#49B3FF',
  baseSpeed = 3.5,
  speedJitter = 1.0,
  size = 2,
  maxParticles = 500,
  smoothSpawn = false,
  randomizeSpawn = false,
  trailAlpha = 0.12, // 잔상 투명도
  backgroundColor = '#ffffff',
  wrapperType = 'WAITING',
  leftTopComponent = undefined,
  rightTopComponent = undefined,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());

  // 분산 방출 관리
  const spawnBudgetRef = useRef(0); // 생성 대기 예산(누적 가능)
  const spawnRateRef = useRef(0); // 초당 생성량

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const spawnOne = (canvas) => {
    const y = clamp(yMin + Math.random() * (yMax - yMin), 0, canvas.height);
    particlesRef.current.push({
      x: -(width * 2) * Math.random() + (wrapperType === 'ENTERED' ? -width : 0),
      y,
      vx: baseSpeed,
      size,
      color: particleColor,
    });
  };

  // count 변화 → 새로운 1초 구간 방출 설정
  useEffect(() => {
    if (actionGroupId == null || updateTrigger == null) {
      return;
    }
    if (!smoothSpawn) {
      // 비분산: count만큼 즉시 생성
      const canvas = canvasRef.current;
      if (!canvas) return;
      const arr = particlesRef.current;
      const spaceLeft = Math.max(0, maxParticles - arr.length);
      const n = Math.min(spaceLeft, Math.max(0, Math.floor(count)));
      for (let i = 0; i < n; i++) spawnOne(canvas);
      return;
    }

    // 분산: 초당 생성량 설정 + 예산 누적
    spawnRateRef.current = Math.max(0, count);
    spawnBudgetRef.current = Math.min(spawnBudgetRef.current + Math.max(0, count), 20_000);
  }, [updateTrigger]);

  // rAF 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const draw = (now) => {
      if (!running) return;

      // delta time
      const prev = lastFrameTimeRef.current;
      const dtMs = Math.max(0, now - prev);
      lastFrameTimeRef.current = now;
      const dt = dtMs / 1000;

      // 분산 방출 처리
      if (smoothSpawn && spawnRateRef.current > 0 && spawnBudgetRef.current > 0) {
        let toSpawn = spawnRateRef.current * dt;
        if (randomizeSpawn) {
          toSpawn *= 0.7 + Math.random() * 0.8; // ±30%
        }
        spawnBudgetRef.current += toSpawn;

        const arr = particlesRef.current;
        const spaceLeft = Math.max(0, maxParticles - arr.length);
        const spawnNow = Math.min(spaceLeft, Math.floor(spawnBudgetRef.current));

        for (let i = 0; i < spawnNow; i++) {
          spawnOne(canvas);
        }
        spawnBudgetRef.current -= spawnNow;
        spawnBudgetRef.current = Math.min(spawnBudgetRef.current, 10_000);
      }

      // 업데이트
      const arr = particlesRef.current;
      for (let i = 0; i < arr.length; i++) {
        arr[i].x += arr[i].vx;
      }

      // 경계 밖 제거
      let write = 0;
      for (let read = 0; read < arr.length; read++) {
        const p = arr[read];
        if (p.x - p.size <= canvas.width) {
          arr[write++] = p;
        }
      }
      arr.length = write;

      // 잔상 페이드(반투명 clear)
      if (trailAlpha > 0) {
        ctx.fillStyle = `rgba(${hexToRgb(backgroundColor)}, ${trailAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // 드로우
      ctx.fillStyle = particleColor;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    lastFrameTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    particleColor,
    baseSpeed,
    speedJitter,
    size,
    maxParticles,
    yMin,
    yMax,
    smoothSpawn,
    randomizeSpawn,
    trailAlpha,
    backgroundColor,
  ]);

  // 캔버스 크기 및 DPR 스케일링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [width, height]);

  return (
    <div
      style={{ position: 'relative', width, height: height, background: 'none', borderRadius: 8 }}
      className={`flex flex-col items-center justify-center `}
    >
      <canvas className={wrapperType === 'WAITING' ? 'rounded-l-xl' : 'rounded-r-xl'} ref={canvasRef} />
      {leftTopComponent != null && (
        <span className="absolute top-1 left-0 translate-x-[4px] text-black text-sm px-1.5 py-0.5 rounded">
          {leftTopComponent}
        </span>
      )}
      {rightTopComponent != null && (
        <span className="absolute top-1 right-0 translate-x-[-4px] text-black text-sm px-1.5 py-0.5 rounded">
          {rightTopComponent}
        </span>
      )}
    </div>
  );
}

// 헬퍼: #RRGGBB → "r,g,b"
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}
