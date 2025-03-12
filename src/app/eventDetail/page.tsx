import { useState } from 'react'
import BodyText from '../../components/BodyText'
import BodyTextEdit from '../../components/BodyTextEdit'
import BodyTextDate from '../../components/BodyTextDate'
import BodyTextDateEdit from '../../components/BodyTextDateEdit'

const dummyEventData = {
    eventName: "신규 상품 출시 이벤트",
    eventDescription: "신규 상품 출시 기념 20% 할인 이벤트입니다.",
    eventType: "프로모션",
    eventUrl: "https://www.example.com/event",
    queueBackpressure: "5",
    createdBy: "홍길동",
    createdDate: "2025-03-01T10:00:00.000Z",
    updatedBy: "이몽룡",
    updatedDate: "2025-03-10T15:00:00.000Z",
    eventStartTime: "2025-03-12T15:30:00.000Z", // 이벤트 시작 일자
    eventEndTime: "2025-03-13T15:30:00.000Z",   // 이벤트 종료 일자
};

const EventDetail = () => {
    const [bodyDescriptionContent, setBodyDescriptionContent] = useState(dummyEventData.eventDescription);
    const [bodyTypeContent, setBodyTypeContent] = useState(dummyEventData.eventType);
    const [bodyUrlContent, setBodyUrlContent] = useState(dummyEventData.eventUrl);
    const [bodyBackpressureContent, setBodyBackpressureContent] = useState(dummyEventData.queueBackpressure);
    const [eventStartTime, setEventStartTime] = useState(dummyEventData.eventStartTime);
    const [eventEndTime, setEventEndTime] = useState(dummyEventData.eventEndTime);

    const handleSave = () => {
        alert("저장되었습니다 ✅");
    };

    const handleCancel = () => {
        alert("취소되었습니다 ❌");
    };

    return (
        <div className='justify-center w-[640px] md:w-[768px] lg:w-[1024px] xl:w-[1280px] h-full mx-auto  py-[50px] ml-8'>
            <div className='flex flex-col text-[32px] text-gray-700 font-extrabold mb-10'>
                이벤트 상세
            </div>
            <div className='flex flex-col w-full mx-auto justify-center py-8 px-12 bg-white rounded-xl border-[0.3px] border-[#B9B9B9]'>
                <div className='text-gray-700 font-semibold text-[24px]'>
                    이벤트 명
                </div>
                <div className='text-black text-[18px] mt-2'>
                    {dummyEventData.eventName}
                </div>
            </div>
            <div className='flex flex-col w-full mx-auto justify-center p-12 bg-white rounded-xl border-[0.3px] border-[#B9B9B9] mt-8'>
                <BodyTextEdit TitleContent="이벤트 설명" BodyContent={bodyDescriptionContent} setBodyContent={setBodyDescriptionContent} />
                <BodyTextEdit TitleContent="이벤트 유형" BodyContent={bodyTypeContent} setBodyContent={setBodyTypeContent} />
                <BodyTextEdit TitleContent="이벤트 Url" BodyContent={bodyUrlContent} setBodyContent={setBodyUrlContent} />
                <BodyTextEdit TitleContent="큐 백프래셔 수치" BodyContent={bodyBackpressureContent} setBodyContent={setBodyBackpressureContent} />
                <div className='flex flex-row w-full items-center'>
                    <div className='w-1/2'>
                        <BodyTextDateEdit
                            TitleContent="이벤트 시작 일자"
                            BodyContent={eventStartTime}
                            onChange={(newDate) => setEventStartTime(new Date(newDate).toISOString())} 
                        />
                    </div>
                    <div className='w-1/2'>
                        <BodyTextDateEdit
                            TitleContent="이벤트 종료 일자"
                            BodyContent={eventEndTime}
                            onChange={(newDate) => setEventEndTime(new Date(newDate).toISOString())} 
                        />
                    </div>
                </div>
                <div className='flex flex-row w-full items-center'>
                    <div className='w-1/2'>
                        <BodyText TitleContent="이벤트 생성자" BodyContent={dummyEventData.createdBy} />
                    </div>
                    <div className='w-1/2'>
                        <BodyTextDate TitleContent="이벤트 생성 일자" BodyContent={dummyEventData.createdDate} />
                    </div>
                </div>
                <div className='flex flex-row w-full items-center'>
                    <div className='w-1/2'>
                        <BodyText TitleContent="이벤트 수정자" BodyContent={dummyEventData.updatedBy} />
                    </div>
                    <div className='w-1/2'>
                        <BodyTextDate TitleContent="이벤트 수정 일자" BodyContent={dummyEventData.updatedDate} />
                    </div>
                </div>
            </div>
            <div className='flex flex-row justify-center w-full items-center mt-12 gap-12'>
                <button 
                    className='w-32 h-16 bg-blue-400 text-white text-[18px] shadow-md hover:bg-blue-700 rounded-lg transition-all duration-200' 
                    onClick={handleSave}>
                    저장하기
                </button>
                <button 
                    className='w-32 h-16 bg-gray-200 text-gray-600 text-[18px] shadow-md hover:bg-gray-300 rounded-lg transition-all duration-200'
                    onClick={handleCancel}>
                    취소
                </button>
            </div>
        </div>
    )
}

export default EventDetail;