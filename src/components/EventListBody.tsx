interface EventItemProps {
    no: number;
    eventName: string;
    eventUrl: string;
    eventStartTime: string;
    eventEndTime: string;
    eventType: string;
}

const EventItem = ({ no, eventName, eventUrl, eventStartTime, eventEndTime, eventType }: EventItemProps) => {
    return (
        <div className='flex flex-row w-full py-4 border-b border-[#B9B9B9]'>
            <div className='w-1/12 ml-4 px-4 py-2'>{no}</div>
            <div className='w-3/12 px-4 py-2'>{eventName}</div>
            <div className='w-3/12 px-4 py-2 hidden md:block'>{eventUrl}</div>
            <div className='w-2/12 px-4 py-2 hidden lg:block'>{eventStartTime}</div>
            <div className='w-2/12 px-4 py-2 hidden lg:block'>{eventEndTime}</div>
            <div className='w-1/12 mr-4 px-4 py-2 hidden xl:block'>{eventType}</div>
        </div>
    );
};

export default EventItem;