export default function ArrowBackSvg({ color = '#000000', size = 24 }) {
  return (
    <svg width={`${size}px`} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points="244 400 100 256 244 112"
        style={{ fill: 'none', stroke: color, strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '48px' }}
      />
      <line
        x1="120"
        y1="256"
        x2="412"
        y2="256"
        style={{ fill: 'none', stroke: color, strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '48px' }}
      />
    </svg>
  );
}
