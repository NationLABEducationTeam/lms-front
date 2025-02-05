import { FC } from 'react';
import { Instagram } from 'lucide-react';

const Footer: FC = () => {
  return (
    <footer className="w-full bg-[#919191]">
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
          <div className="text-sm text-white/90">
            © 2025 AI NATION . All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/aination.edu2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm">Instagram</span>
            </a>
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