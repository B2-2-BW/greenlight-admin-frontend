import { Link } from 'react-router';

export default function SideBarMenuListItem({ title, append, prepend, onClick, path, newtab }) {
  return (
    <li onClick={onClick}>
      <Link
        to={path}
        target={newtab ? '_blank' : '_self'}
        className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
      >
        {prepend != null && prepend}
        <span className="ms-3">{title}</span>
        {append != null && append}
      </Link>
    </li>
  );
}
