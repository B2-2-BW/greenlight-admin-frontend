import { useSortable } from '@dnd-kit/react/sortable';
import PipeCard from './PipeCard.jsx';

export default function SortablePipeCard({ room, index, group, disabled, trafficData, emitSignal }) {
  const { ref, handleRef, isDragSource } = useSortable({ id: room.roomId, index, group, disabled });

  return (
    <div ref={ref} data-room-id={room.roomId} className={`h-[400px] min-w-0 ${isDragSource ? 'relative z-10' : ''}`}>
      <PipeCard
        room={room}
        trafficData={trafficData}
        emitSignal={emitSignal}
        dragHandle={
          <button
            ref={handleRef}
            type="button"
            disabled={disabled}
            aria-label={`${room.name} 순서 이동`}
            title="드래그하여 순서 변경"
            className="flex h-8 w-5 shrink-0 touch-none cursor-grab items-center justify-center rounded text-neutral-400 hover:text-neutral-600 focus-visible:outline-2 focus-visible:outline-accent active:cursor-grabbing"
          >
            <svg aria-hidden="true" width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
              <circle cx="5" cy="5" r="1.5" />
              <circle cx="11" cy="5" r="1.5" />
              <circle cx="5" cy="10" r="1.5" />
              <circle cx="11" cy="10" r="1.5" />
              <circle cx="5" cy="15" r="1.5" />
              <circle cx="11" cy="15" r="1.5" />
            </svg>
          </button>
        }
      />
    </div>
  );
}
