export const defaultAlertPolicy = {
  forTicks: 2,
  repeatIntervalSeconds: 3600,
  waitingCompare: 'COUNT',
  waitingThreshold: 1,
};

export const compareOptions = [
  { value: 'COUNT', label: '절대값 (명)' },
  { value: 'PERCENT', label: '비율 (%)' },
];

export function normalizeAlertPolicy(data) {
  return {
    forTicks: data?.forTicks ?? defaultAlertPolicy.forTicks,
    repeatIntervalSeconds: data?.repeatIntervalSeconds ?? defaultAlertPolicy.repeatIntervalSeconds,
    waitingCompare: data?.waitingCompare ?? defaultAlertPolicy.waitingCompare,
    waitingThreshold: data?.waitingThreshold ?? defaultAlertPolicy.waitingThreshold,
  };
}

export function alertPolicyPayload(policy) {
  return {
    forTicks: Number(policy.forTicks),
    repeatIntervalSeconds: Number(policy.repeatIntervalSeconds),
    waitingCompare: policy.waitingCompare,
    waitingThreshold: Number(policy.waitingThreshold),
  };
}

export function isSameAlertPolicy(left, right) {
  return JSON.stringify(alertPolicyPayload(left)) === JSON.stringify(alertPolicyPayload(right));
}
