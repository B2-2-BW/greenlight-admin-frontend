import "../App.css";

interface BodyTextDateProps {
    TitleContent: string;
    BodyContent: string; // ISO 형식의 날짜 문자열
}

const formatDate = (isoString: string): string => {
    if (!isoString) return "날짜 없음"; // 값이 없을 경우 대비

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "유효하지 않은 날짜"; // 잘못된 날짜 처리

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // 24시간제
    });
};

const BodyTextDate: React.FC<BodyTextDateProps> = ({ TitleContent, BodyContent }) => {
    return (
        <div className="mb-8">
          <div className="text-gray-700 font-semibold text-[22px]">{TitleContent}</div>
          <div className="text-black text-[18px] mt-2">{formatDate(BodyContent)}</div>
        </div>
    );
};

export default BodyTextDate;