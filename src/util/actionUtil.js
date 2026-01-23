const getActionUrl = (actionType, action) => {
  if (actionType == null) {
    return '';
  } else if (actionType === 'LANDING') {
    return `https://greenlight.thehyundai.com/l/${action?.landingId}`;
  } else {
    return action?.actionUrl;
  }
};

export const ActionUtil = {
  getActionUrl,
};
