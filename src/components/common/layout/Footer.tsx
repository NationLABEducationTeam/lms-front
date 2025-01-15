import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="w-full bg-[#919191]">
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-white/90">
            © 2025 AI NATION . All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-white/90 hover:text-white transition-colors">이용약관</a>
            <a href="#" className="text-white/90 hover:text-white transition-colors">개인정보처리방침</a>
            <a href="#" className="text-white/90 hover:text-white transition-colors">고객센터</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 