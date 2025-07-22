export default function ActionUrl({ action }) {
  let innerText;
  if (action == null || !action?.actionType) {
    innerText = '';
  } else if (action.actionType === 'LANDING') {
    innerText = `/land/${action.landingId}`;
  } else {
    innerText = action.actionUrl;
  }
  return <div>{innerText}</div>;
}
