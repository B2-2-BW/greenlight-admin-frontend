export const PlusIcon = ({ size = 24, width, height, ...props }) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );
};

export const VerticalDotsIcon = ({ size = 24, width, height, ...props }) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SearchIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
};

export const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...otherProps}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export const ExternalLinkIcon = ({ color = '#000000', size = 24 }) => {
  return (
    <svg width={`${size}px`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 5C13.4477 5 13 4.55228 13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11C19.4477 11 19 10.5523 19 10V6.41421L11.7071 13.7071C11.3166 14.0976 10.6834 14.0976 10.2929 13.7071C9.90237 13.3166 9.90237 12.6834 10.2929 12.2929L17.5858 5H14ZM5 7C4.44772 7 4 7.44772 4 8V19C4 19.5523 4.44772 20 5 20H16C16.5523 20 17 19.5523 17 19V14.4375C17 13.8852 17.4477 13.4375 18 13.4375C18.5523 13.4375 19 13.8852 19 14.4375V19C19 20.6569 17.6569 22 16 22H5C3.34315 22 2 20.6569 2 19V8C2 6.34315 3.34315 5 5 5H9.5625C10.1148 5 10.5625 5.44772 10.5625 6C10.5625 6.55228 10.1148 7 9.5625 7H5Z"
        fill={color}
      />
    </svg>
  );
};
