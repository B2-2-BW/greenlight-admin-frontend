import React, { useEffect, useRef, useId } from 'react';

/**
 * TrafficWave Component
 *
 * @param {string} color - 파도 메인 색상 (Hex, RGB)
 * @param {number} height - 수위 (0 ~ 100)
 * @param {number} amplitude - 파도의 높낮이 (기본: 20)
 * @param {number} speed - 파도의 속도 (기본: 0.15)
 */
export default function Wave({
  color = '#3b82f6', // 기본 Blue
  height = 50, // 0 ~ 100%
  amplitude = 4, // 파도 굴곡의 세기
  speed = 0.15, // 파도 흐름 속도
}) {
  const pathRef = useRef(null);
  const rafId = useRef(null);

  // 애니메이션 상태 관리 (Ref로 관리하여 리렌더링 방지)
  const state = useRef({
    phase: 0, // 파도의 X축 이동 위상
    currentHeight: 0, // 현재 보여지는 높이 (부드러운 전환용)
  });

  const gradientId = useId(); // 다중 컴포넌트 사용 시 ID 충돌 방지

  useEffect(() => {
    // 초기 시작 높이 설정 (첫 렌더링 시 애니메이션 없이 바로 잡고 싶다면 주석 해제)
    // state.current.currentHeight = height;

    const animate = () => {
      const { current: s } = state;

      // 1. 위상 업데이트 (파도 움직임)
      s.phase += speed;

      // 2. 높이 보간 (Lerp: Linear Interpolation)
      // 목표 높이(height)로 매 프레임마다 5%씩 접근 -> 부드러운 감속 효과
      const targetHeight = height;
      s.currentHeight += (targetHeight - s.currentHeight) * 0.05;

      // 3. SVG Path 생성
      // viewBox가 0 0 100 100 기준이므로, 좌표계도 100x100으로 계산
      const points = [];
      const totalPoints = 100; // X축 해상도

      // 시작점 (왼쪽 아래)
      points.push('M 0 100');

      // 파도 곡선 계산
      for (let x = 0; x <= totalPoints; x++) {
        // Sine Wave 공식: y = A * sin(kx + phase) + bias
        // SVG 좌표계는 y가 아래로 갈수록 커지므로 (100 - 높이)가 기준선
        // amplitude가 너무 크면 0이나 100을 뚫을 수 있으므로 보정 필요할 수 있음

        // s.currentHeight가 0이면 파도가 아예 없어야 하므로 amplitude도 줄임
        const currentAmp = s.currentHeight < 5 ? 0 : amplitude;

        const y = 100 - s.currentHeight + Math.sin(x * 0.1 + s.phase) * (currentAmp * 0.5);
        points.push(`L ${x} ${y}`);
      }

      // 끝점 (오른쪽 아래) -> 닫힌 도형 만들기
      points.push('L 100 100');
      points.push('Z');

      // 4. DOM 직접 업데이트
      if (pathRef.current) {
        pathRef.current.setAttribute('d', points.join(' '));
      }

      rafId.current = requestAnimationFrame(animate);
    };

    // 애니메이션 시작
    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [height, amplitude, speed]); // 의존성 배열: 이 값들이 바뀌어도 애니메이션은 끊기지 않고 자연스럽게 이어짐

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none" // 비율 상관없이 꽉 차게 늘림
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            {/* 상단: 진한 색 */}
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            {/* 하단: 연한 색 (White와 섞거나 투명도 조절) */}
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <path
          ref={pathRef}
          fill={`url(#${gradientId})`}
          // 초기값 (깜빡임 방지용 바닥)
          d="M 0 100 L 100 100 L 100 100 Z"
        />
      </svg>
    </div>
  );
}
