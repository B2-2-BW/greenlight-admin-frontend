import './PipeCard.css'; // 아래 CSS 파일을 생성해주세요

/**
 * @param {Object} props
 * @param {ReactNode} props.inflowEmitterComponent - 상단 유입 파티클 컴포넌트
 * @param {ReactNode} props.waveComponent - 중앙 수위(Wave) 컴포넌트
 * @param {ReactNode} props.outflowEmitterComponent - 하단 이탈 파티클 컴포넌트
 * @param {Object} props.data - 모니터링 수치 데이터
 */
export default function TrafficPipeDashboard({
  inflowEmitterComponent,
  waveComponent,
  outflowEmitterComponent,
  data = {
    pageName: '메인 예매 페이지',
    waitingCount: 1420,
    expectedWait: '04:20',
    inflowRate: 120,
    currentUsers: 850,
    capacityRate: 75,
    outflowRate: 115,
    status: 'LIVE',
  },
}) {
  return (
    <div className="traffic-dashboard-scope">
      <div className="pipe-card">
        {/* Header */}
        <div className="card-header">
          <h3 className="page-title">{data.pageName}</h3>
          <span className="status-badge live">{data.status}</span>
        </div>

        <div className="pipe-body">
          {/* 1. Top Section: 유입 (Inflow) */}
          <div className="pipe-section top-section">
            {/* 좌측 HUD: 대기열 정보 */}
            <div className="hud-panel left">
              <div className="stat-group warning">
                <span className="label">대기 인원</span>
                <span className="value">{data.waitingCount.toLocaleString()}</span>
              </div>
              <div className="stat-group">
                <span className="label">예상 대기</span>
                <span className="value">{data.expectedWait}</span>
              </div>

              <div className="stat-group">
                <span className="label">진입 속도</span>
                <span className="value">{data.inflowRate}/sec</span>
              </div>
            </div>

            {/* Emitter Slot (Top) */}
            <div className="emitter-container top">
              <div className="component-slot">
                {inflowEmitterComponent || <div className="mock-visual">Particle In</div>}
              </div>
            </div>
          </div>

          {/* 2. Middle Section: 체류 (Retention/Wave) */}
          <div className="pipe-section middle-section">
            {/* Glass Tank */}
            <div className="glass-tank">
              {/* Wave Component Slot */}
              <div className="wave-slot">
                {waveComponent || <div className="mock-wave" style={{ height: `${data.capacityRate}%` }}></div>}
              </div>
            </div>

            {/* Center Overlay Info */}
            <div className="center-overlay">
              <span className="current-users">{data.currentUsers.toLocaleString()}명</span>
              <span className="capacity-rate">수용률 {data.capacityRate}%</span>
            </div>
          </div>

          {/* 3. Bottom Section: 이탈 (Outflow) */}
          <div className="pipe-section bottom-section">
            {/* Emitter Slot (Bottom) */}
            <div className="emitter-container bottom">
              <div className="component-slot">
                {outflowEmitterComponent || <div className="mock-visual">Particle Out</div>}
              </div>
            </div>

            {/* Bottom HUD: 이탈 속도 */}
            <div className="hud-panel bottom-center">
              <span className="value">{data.outflowRate}/sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
