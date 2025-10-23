export const formatDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatRelativeDate = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: '년', seconds: 31536000 },
    { label: '개월', seconds: 2592000 },
    { label: '일', seconds: 86400 },
    { label: '시간', seconds: 3600 },
    { label: '분', seconds: 60 },
    { label: '초', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label} 전`;
    }
  }

  return '방금 전';
};

export const toDateHtml = (cellValue) => {
  return (
    <div className="flex flex-col">
      <p className="text-sm">{formatRelativeDate(cellValue)}</p>
      <p className="text-xs text-default-400">{formatDate(cellValue)}</p>
    </div>
  );
};

const timestampToDateTime = (timestamp) => {
  if (!timestamp) {
    return '-';
  }
  return new Date(timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
};

export const DateUtil = {
  timestampToDateTime,
};
