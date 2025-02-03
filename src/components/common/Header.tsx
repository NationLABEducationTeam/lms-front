import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <a 
        href="https://business.nationslab.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
      >
        <Briefcase className="w-3.5 h-3.5 text-brown-600" />
        기업교육
      </a>
      <button 
        onClick={() => navigate('/corporate')}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
      >
        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
        기업교육
      </button>
    </div>
  );
};

export default Header; 