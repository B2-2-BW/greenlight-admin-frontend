import '../App.css';

interface BodyTextProps {
    TitleContent: string;
    BodyContent: string;
}

const BodyText: React.FC<BodyTextProps> = ({ TitleContent, BodyContent }) => {
    return (
        <div className="mb-8">
        <div className="text-gray-700 font-semibold text-[22px]">
            {TitleContent}
        </div>
        <div className="text-black text-[18px] mt-2">
            {BodyContent}
        </div>
        </div>
    );
};

export default BodyText;