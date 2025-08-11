import { ActionUtil } from '../../util/actionUtil.js';

export default function ActionUrl({ action }) {
  let innerText = ActionUtil.getActionUrl(action?.actionType, action);
  return <div>{innerText}</div>;
}
