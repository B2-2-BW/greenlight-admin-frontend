import { Link } from 'react-router';

export default function SideBarMenuListItem({ title, append, prepend, active, path, newtab }) {
  return (
    // <li onClick={onClick}>
    <Link
      to={path}
      target={newtab ? '_blank' : '_self'}
      className={`flex items-center p-2 rounded-xl  ${active ? 'bg-white text-black shadow font-semibold' : 'text-neutral-600 hover:bg-neutral-200'}`}
    >
      {prepend != null && prepend}
      <span className="ms-3">{title}</span>
      {append != null && append}
    </Link>
    // </li>
  );
}
