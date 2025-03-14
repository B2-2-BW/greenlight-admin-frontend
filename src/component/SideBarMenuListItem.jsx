export default function SideBarMenuListItem({ title, append, onClick }) {
  return (
    <li onClick={onClick}>
      <a
        href="#"
        className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
      >
        {append != null && append}
        <span className="ms-3">{title}</span>
      </a>
    </li>
  );
}
