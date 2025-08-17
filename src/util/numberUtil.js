const fmt = new Intl.NumberFormat('ko-KR');

const formatNumber = (num) => {
  if (isNaN(Number(num))) {
    return ' - ';
  }
  return fmt.format(num);
};

export const NumberUtil = {
  formatNumber,
};
