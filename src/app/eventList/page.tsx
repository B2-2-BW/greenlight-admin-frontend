import EventItem from "../../components/eventListBody";

const dummyEventData = [
    {
        no: 1,
        eventName: "신규 상품 출시 이벤트",
        eventUrl: "https://www.example.com/event1",
        eventStartTime: "2025-03-12T15:30:00.000Z",
        eventEndTime: "2025-03-13T15:30:00.000Z",
        eventType: "프로모션",
    },
    {
        no: 2,
        eventName: "봄맞이 할인 이벤트",
        eventUrl: "https://www.example.com/event2",
        eventStartTime: "2025-04-01T10:00:00.000Z",
        eventEndTime: "2025-04-10T18:00:00.000Z",
        eventType: "세일",
    },
    {
        no: 3,
        eventName: "여름 한정 이벤트",
        eventUrl: "https://www.example.com/event3",
        eventStartTime: "2025-06-01T08:00:00.000Z",
        eventEndTime: "2025-06-15T20:00:00.000Z",
        eventType: "기타",
    }
];

const EventList = () => {
    return (
        <div className='justify-center w-[640px] md:w-[768px] lg:w-[1024px] xl:w-[1280px] h-full mx-auto py-[50px] ml-8'>
            <div className='flex flex-col text-[32px] text-gray-700 font-extrabold mb-10'>
                이벤트 목록
            </div>
            <div className='flex flex-col w-full mx-auto justify-center bg-white rounded-xl border-[0.3px] border-[#B9B9B9]'>
                <div className='flex flex-row w-full py-4 border-b border-[#B9B9B9]'>
                    <div className='w-1/12 ml-4 px-4 py-2 font-semibold'>NO</div>
                    <div className='w-3/12 px-4 py-2 font-semibold'>이벤트명</div>
                    <div className='w-3/12 px-4 py-2 font-semibold hidden md:block'>이벤트URL</div>
                    <div className='w-2/12 px-4 py-2 font-semibold hidden lg:block'>이벤트 시작 시간</div>
                    <div className='w-2/12 px-4 py-2 font-semibold hidden lg:block'>이벤트 종료 시간</div>
                    <div className='w-1/12 mr-4 px-4 py-2 font-semibold hidden xl:block'>이벤트 유형</div>
                </div>
                {dummyEventData.map((event) => (
                    <EventItem
                        key={event.no}
                        no={event.no}
                        eventName={event.eventName}
                        eventUrl={event.eventUrl}
                        eventStartTime={event.eventStartTime}
                        eventEndTime={event.eventEndTime}
                        eventType={event.eventType}
                    />
                ))}
            </div>
        </div>
    );
};

export default EventList;