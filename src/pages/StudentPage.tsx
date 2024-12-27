import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { Button } from '../components/ui/button';
import FileUpload from '../components/FileUpload';

const StudentPage = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('userRole');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/nationlmslogo.png" alt="NationsLAB LMS" className="h-8 sm:h-10 w-auto" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">학생 대시보드</h1>
              <p className="text-sm sm:text-base text-blue-300 mt-0.5 sm:mt-1">환영합니다! 오늘도 열공 모드!</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="outline"
            className="w-full sm:w-auto bg-white hover:bg-blue-50 text-slate-900 hover:text-blue-600 border-2 transition-colors text-sm sm:text-base h-9 sm:h-10"
          >
            로그아웃
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">내 강의실</h2>
            <p className="text-sm sm:text-base text-blue-300">현재 수강 중인 강의가 없습니다.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">학습 현황</h2>
            <p className="text-sm sm:text-base text-blue-300">아직 학습 기록이 없습니다.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">공지사항</h2>
            <p className="text-sm sm:text-base text-blue-300">새로운 공지사항이 없습니다.</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">파일 업로드</h2>
          <FileUpload userRole="STUDENT" />
        </div>
      </div>
    </div>
  );
};

export default StudentPage; 