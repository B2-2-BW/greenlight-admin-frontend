const fmt = new Intl.NumberFormat('ko-KR');

const formatNumber = (num) => {
  if (isNaN(Number(num))) {
    return ' - ';
  }
  return fmt.format(num);
};

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export const NumberUtil = {
  formatNumber,
  round,
};
