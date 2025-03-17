import { FC, ChangeEvent, useRef, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
}

const CodeEditor: FC<CodeEditorProps> = ({ code, language, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // 탭 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      // 탭 문자 대신 2칸 공백 삽입
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue);
      
      // 커서 위치 조정
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // 라인 번호 업데이트
  useEffect(() => {
    if (lineNumbersRef.current) {
      const lineCount = code.split('\n').length;
      const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)
        .map(num => `<div>${num}</div>`)
        .join('');
      lineNumbersRef.current.innerHTML = lineNumbers;
    }
  }, [code]);

  return (
    <div className="h-full w-full relative flex">
      <div 
        ref={lineNumbersRef}
        className="bg-gray-800 text-gray-500 text-right pr-2 pt-4 text-sm font-mono select-none"
        style={{ minWidth: '2rem' }}
      />
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
        spellCheck="false"
        placeholder={`${language} 코드를 작성하세요...`}
      />
      <div className="absolute top-2 right-2 bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs">
        {language === 'javascript' ? 'JavaScript' : 
         language === 'python' ? 'Python' : 
         language === 'java' ? 'Java' : language}
      </div>
    </div>
  );
};

export default CodeEditor; 