const fmt = new Intl.NumberFormat('ko-KR');

const formatNumber = (num) => {
  return fmt.format(num);
};

export const NumberUtil = {
  formatNumber,
};
