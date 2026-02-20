import { useEffect, useRef, useId } from 'react';

/**
 * TrafficWave Component
 *
 * @param {string} color - 파도 메인 색상 (Hex, RGB)
 * @param {number} height - 수위 (0 ~ 100)
 * @param {number} amplitude - 파도의 높낮이 (기본: 20)
 * @param {number} speed - 파도의 속도 (기본: 0.15)
 */
export default function Wave({
  color = '#DCDCDCAA',
  height = 50, // 0 ~ 100%
  amplitude = 4, // 0이면 정지 상태(사각형)
  speed = 0.15,
}) {
  const pathRef = useRef(null);
  const rafId = useRef(null);
  const state = useRef({
    phase: 0,
    currentHeight: height, // 초기값으로 설정하여 깜빡임 방지
  });

  const gradientId = useId();

  useEffect(() => {
    // [성능 최적화] amplitude가 0이면 애니메이션 루프를 시작하지 않음
    if (amplitude <= 0) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    const animate = () => {
      const { current: s } = state;
      s.phase += speed;

      // 높이 보간 (Lerp)
      s.currentHeight += (height - s.currentHeight) * 0.05;

      const totalPoints = 100;
      const points = ['M 0 100'];

      for (let x = 0; x <= totalPoints; x++) {
        const y = 100 - s.currentHeight + Math.sin(x * 0.1 + s.phase) * (amplitude * 0.5);
        points.push(`L ${x} ${y}`);
      }

      points.push('L 100 100');
      points.push('Z');

      if (pathRef.current) {
        pathRef.current.setAttribute('d', points.join(' '));
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [height, amplitude, speed]);

  // 2. Amplitude가 0보다 클 때: 애니메이션 SVG 반환
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path ref={pathRef} fill={`url(#${gradientId})`} d="M 0 100 L 100 100 L 100 100 Z" />
      </svg>
    </div>
  );
}
