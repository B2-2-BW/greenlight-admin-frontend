import { Link } from 'react-router';

export default function SideBarMenuListItem({ title, append, prepend, active, path, newtab, onNavigate }) {
  return (
    <li>
      <Link
        to={path}
        target={newtab ? '_blank' : undefined}
        rel={newtab ? 'noopener noreferrer' : undefined}
        onClick={onNavigate}
        className={`flex min-h-11 items-center rounded-xl p-2 ${
          active ? 'bg-white font-semibold text-black shadow' : 'text-neutral-600 hover:bg-neutral-200'
        }`}
      >
        {prepend != null && prepend}
        <span className="ms-3">{title}</span>
        {append != null && append}
      </Link>
    </li>
  );
}
