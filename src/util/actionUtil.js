const getActionUrl = (actionType, action) => {
  if (actionType == null) {
    return '';
  } else if (actionType === 'LANDING') {
    return `https://wt.greenlight.winten.im/l/${action?.landingId}`;
  } else {
    return action?.actionUrl;
  }
};

export const ActionUtil = {
  getActionUrl,
};
