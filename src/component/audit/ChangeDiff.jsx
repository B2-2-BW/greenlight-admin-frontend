import { Chip } from '@heroui/react';

const labels = {
  siteName: '사이트명',
  siteDescription: '사이트 설명',
  siteEnabled: '사이트 활성 상태',
  queueEnabled: '대기열 운영 상태',
  apiKeyRotated: 'API Key',
  deleted: '폐기 상태',
  name: '대기열명',
  description: '대기열 설명',
  enabled: '대기열 활성 상태',
  maxTrafficPerSecond: '초당 허용 트래픽',
  capacity: '수용량',
  defaultRuleType: '기본 규칙',
  defaultDestinationUrl: '기본 이동 URL',
  roomEnvironment: '환경',
  adImageUrl: '광고 이미지 URL',
  roomRules: '대기열 규칙',
  accountStatus: '계정 상태',
  username: '사용자명',
  userEmail: '이메일',
  siteId: '사이트',
  userRole: '역할',
  passwordReset: '비밀번호 초기화',
};

const displayValue = (value, field) => {
  if (value === null || value === undefined || value === '') return '(없음)';
  if (field === 'deleted') return value ? '폐기됨' : '정상';
  if (field === 'apiKeyRotated') return value ? '교체됨' : '교체 전';
  if (field === 'passwordReset') return value ? '초기화됨' : '초기화 전';
  if (typeof value === 'boolean') return value ? '활성' : '비활성';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '(표시할 수 없는 값)';
    }
  }
  return String(value);
};

export default function ChangeDiff({ changes }) {
  const entries = Object.entries(changes ?? {});
  if (entries.length === 0) {
    return <p className="text-sm text-muted">변경된 항목이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([field, change]) => (
        <div key={field} className="rounded-xl border border-separator bg-neutral-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Chip size="sm" variant="soft">{labels[field] ?? field}</Chip>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-sm">
            <span className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-muted">
              {displayValue(change.before, field)}
            </span>
            <span aria-hidden className="text-center text-muted">→</span>
            <span className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-medium">
              {displayValue(change.after, field)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
