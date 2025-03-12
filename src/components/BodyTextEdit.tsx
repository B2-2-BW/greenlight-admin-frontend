interface BodyTextProps {
    TitleContent: string;
    BodyContent: string;
    setBodyContent: (value: string) => void; // 상태를 수정하는 함수
  }
  
  const BodyTextEdit: React.FC<BodyTextProps> = ({ TitleContent, BodyContent, setBodyContent }) => {
    return (
      <div className="mb-8">
        <div className="text-gray-700 font-semibold text-[22px]">{TitleContent}</div>
        <textarea
          className="w-full text-black text-[18px] mt-2 px-4 py-2 border border-gray-300 rounded"
          value={BodyContent}
          onChange={(e) => setBodyContent(e.target.value)} // 입력할 때마다 상위 컴포넌트의 setBodyContent 호출
        />
      </div>
    );
  };
  
  export default BodyTextEdit;