import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';

const DeepCodingHeader: FC = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div 
            className="flex items-center cursor-pointer gap-1"
            onClick={() => navigate('/deepcoding')}
          >
            <img src="/long-logo.png" alt="Nation's LAB DeepCoding" className="h-8" />
            <span className="font-bold text-lg bg-gradient-to-r from-purple-500 to-indigo-700 bg-clip-text text-transparent">
              DeepCoding
            </span>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">
              서비스 소개
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              요금제
            </a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900 font-medium">
              자주 묻는 질문
            </a>
            <Button 
              onClick={() => window.open('https://deepcoding.nationlab.io', '_blank')}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              테스트 시작하기
            </Button>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DeepCodingHeader; 