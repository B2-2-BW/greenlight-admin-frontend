import EventListTable from '../component/EventListTable.jsx';
import EventDetailModal from '../component/EventDetailModal.jsx';
import { useDisclosure } from '@heroui/react';

export default function EventPage() {
  const {
    isOpen: isEventDetailOpen,
    onOpen: onEventDetailOpen,
    onOpenChange: onEventDetailOpenChange,
  } = useDisclosure();
  return (
    <>
      <EventListTable onOpen={onEventDetailOpen} />
      <EventDetailModal
        isOpen={isEventDetailOpen}
        onOpenChange={onEventDetailOpenChange}
      />
    </>
  );
}
