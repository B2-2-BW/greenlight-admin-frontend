import { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";
import CalendarIcon from "../assets/calendar.svg";
import { ko } from "date-fns/locale";

interface BodyTextDateEditProps {
    TitleContent: string;
    BodyContent: string;
    onChange: (newDate: string) => void;
}

const CustomInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
        <div className="relative w-full flex items-center border-2 border-gray-300 rounded-xl cursor-pointer">
            <img src={CalendarIcon} alt="캘린더 아이콘" className="w-6 h-6 ml-4" />
            <input
                ref={ref}
                value={value}
                onClick={onClick}
                readOnly
                className="w-full px-6 py-3 text-gray-700 text-[18px] outline-none cursor-pointer bg-transparent"
            />
        </div>
    )
);

const BodyTextDateEdit: React.FC<BodyTextDateEditProps> = ({ TitleContent, BodyContent, onChange }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(BodyContent ? new Date(BodyContent) : null);

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        if (date) {
            onChange(date.toISOString()); // ISO 형식 변환 후 전달
        }
    };

    return (
        <div className="w-full mb-8">
            <div className="mb-4 text-gray-800 font-semibold text-[22px]">{TitleContent}</div>
            <DatePicker
                locale={ko}
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd HH:mm"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                customInput={<CustomInput />}
            />
        </div>
    );
};

export default BodyTextDateEdit;