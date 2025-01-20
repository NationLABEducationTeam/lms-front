import { FC, useState } from 'react';
import { 
  Bell, FileText, HelpCircle, PlayCircle, BookOpen, Download, Calendar, Video, User,
  PenLine, MessageSquare, Award, BarChart, ChevronDown
} from 'lucide-react';

const StudentCoursesPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'notices' | 'assignments' | 'qna' | 'notes' | 'posts' | 'progress'>('curriculum');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<'aws' | 'network'>('aws');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isLiveClassAvailable = selectedCourse === 'aws';
  
  // 더미 데이터
  const courseProgress = {
    aws: {
      attendanceRate: 75,
      completionRate: 60,
      isCompleted: false
    },
    network: {
      attendanceRate: 100,
      completionRate: 100,
      isCompleted: true
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Course Selection Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-lg text-slate-900">
                      {selectedCourse === 'aws' ? 'AWS 클라우드 기초' : '네트워크 보안 심화'}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center mt-0.5">
                      <User className="w-4 h-4 mr-1.5" />
                      <span>{selectedCourse === 'aws' ? '김강사' : '이교수'}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>{selectedCourse === 'aws' ? '오늘 19:00' : '3월 25일 15:00'}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg divide-y divide-slate-100">
                    <button
                      onClick={() => {
                        setSelectedCourse('aws');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-slate-900">AWS 클라우드 기초</div>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <User className="w-4 h-4 mr-1.5" />
                        <span>김강사</span>
                        <span className="mx-2">•</span>
                        <Calendar className="w-4 h-4 mr-1.5" />
                        <span>오늘 19:00</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse('network');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-slate-900">네트워크 보안 심화</div>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <User className="w-4 h-4 mr-1.5" />
                        <span>이교수</span>
                        <span className="mx-2">•</span>
                        <Calendar className="w-4 h-4 mr-1.5" />
                        <span>3월 25일 15:00</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button 
              className={`inline-flex items-center px-5 py-2.5 rounded-lg transition-all duration-200 ${
                isLiveClassAvailable
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!isLiveClassAvailable}
              title={!isLiveClassAvailable ? "수업 시작 15분 전부터 입장 가능합니다" : undefined}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {isLiveClassAvailable ? '실시간 수업 입장' : '수업 준비중'}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Navigation Menu */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'curriculum'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">커리큘럼</span>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'progress'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart className="w-5 h-5" />
                <span className="font-medium">학습 현황</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PenLine className="w-5 h-5" />
                <span className="font-medium">강의 노트</span>
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">게시글</span>
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notices'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">공지사항</span>
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                  N
                </span>
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'assignments'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">과제</span>
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                  2
                </span>
              </button>
              <button
                onClick={() => setActiveTab('qna')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'qna'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">질의응답</span>
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  1
                </span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm shadow-slate-200">
            <div className="p-8">
              {/* Tab Content */}
              <div className="mt-8">
                {activeTab === 'curriculum' && (
                  <div>
                    {/* Week Selection */}
                    <div className="mb-8">
                      <div className="inline-flex p-1 space-x-1 bg-slate-100 rounded-lg">
                        {[1, 2, 3, 4].map((week) => (
                          <button
                            key={week}
                            onClick={() => setSelectedWeek(week)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                              selectedWeek === week
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {week}주차
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Content */}
                    <div className="space-y-6">
                      {selectedWeek === 1 && (
                        <div className="rounded-xl border border-slate-200 divide-y divide-slate-200">
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900">1주차: AWS 소개 및 기본 개념</h3>
                          </div>
                          
                          {/* Live Class */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">이번 주 수업</h4>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                              <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                                <div>
                                  <div className="font-medium text-slate-900">2024-03-20 19:00</div>
                                  <div className="text-sm text-slate-600">AWS 클라우드 컴퓨팅 개요</div>
                                </div>
                              </div>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                                입장하기
                              </button>
                            </div>
                          </div>

                          {/* Materials */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">학습 자료</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center">
                                  <Download className="w-5 h-5 text-slate-400 mr-3" />
                                  <div className="font-medium text-slate-900">1주차 강의자료.pdf</div>
                                </div>
                                <button className="text-blue-600 font-medium hover:text-blue-700">다운로드</button>
                              </div>
                            </div>
                          </div>

                          {/* Assignment */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">과제</h4>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-slate-400 mr-3" />
                                <div>
                                  <div className="font-medium text-slate-900">EC2 인스턴스 생성 실습</div>
                                  <div className="text-sm text-slate-600">마감일: 2024-03-20</div>
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                미제출
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedWeek === 2 && (
                        <div className="rounded-xl border border-slate-200 divide-y divide-slate-200">
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900">2주차: EC2와 VPC</h3>
                          </div>
                          
                          {/* VOD */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">이번 주 수업</h4>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center">
                                <Video className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="font-medium text-slate-900">EC2와 VPC 기초</div>
                                  <div className="text-sm text-slate-600">1시간 30분</div>
                                </div>
                              </div>
                              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-sm hover:bg-gray-700 transition-colors">
                                시청하기
                              </button>
                            </div>
                          </div>

                          {/* Materials */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">학습 자료</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center">
                                  <Download className="w-5 h-5 text-slate-400 mr-3" />
                                  <div className="font-medium text-slate-900">2주차 강의자료.pdf</div>
                                </div>
                                <button className="text-blue-600 font-medium hover:text-blue-700">다운로드</button>
                              </div>
                            </div>
                          </div>

                          {/* Assignment */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">과제</h4>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-slate-400 mr-3" />
                                <div>
                                  <div className="font-medium text-slate-900">VPC 구성하기</div>
                                  <div className="text-sm text-slate-600">마감일: 2024-03-27</div>
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                미제출
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedWeek === 3 && (
                        <div className="rounded-xl border border-slate-200 divide-y divide-slate-200">
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900">3주차: S3와 CloudFront</h3>
                          </div>
                          
                          {/* Live Class */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">이번 주 수업</h4>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="font-medium text-slate-900">2024-03-25 15:00</div>
                                  <div className="text-sm text-slate-600">S3와 CloudFront 실습</div>
                                </div>
                              </div>
                              <button 
                                className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                                disabled
                                title="수업 시작 15분 전부터 입장 가능합니다"
                              >
                                수업 준비중
                              </button>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">* 수업 시작 15분 전부터 입장이 가능합니다.</p>
                          </div>

                          {/* Materials */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">학습 자료</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center">
                                  <Download className="w-5 h-5 text-slate-400 mr-3" />
                                  <div className="font-medium text-slate-900">3주차 강의자료.pdf</div>
                                </div>
                                <button className="text-blue-600 font-medium hover:text-blue-700">다운로드</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedWeek === 4 && (
                        <div className="rounded-xl border border-slate-200 divide-y divide-slate-200">
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900">4주차: Lambda와 API Gateway</h3>
                          </div>
                          
                          {/* VOD */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">이번 주 수업</h4>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center">
                                <Video className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="font-medium text-slate-900">서버리스 아키텍처의 이해</div>
                                  <div className="text-sm text-slate-600">2시간</div>
                                </div>
                              </div>
                              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-sm hover:bg-gray-700 transition-colors">
                                시청하기
                              </button>
                            </div>
                          </div>

                          {/* Materials */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">학습 자료</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center">
                                  <Download className="w-5 h-5 text-slate-400 mr-3" />
                                  <div className="font-medium text-slate-900">4주차 강의자료.pdf</div>
                                </div>
                                <button className="text-blue-600 font-medium hover:text-blue-700">다운로드</button>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center">
                                  <Download className="w-5 h-5 text-slate-400 mr-3" />
                                  <div className="font-medium text-slate-900">Lambda 실습 가이드.pdf</div>
                                </div>
                                <button className="text-blue-600 font-medium hover:text-blue-700">다운로드</button>
                              </div>
                            </div>
                          </div>

                          {/* Assignment */}
                          <div className="p-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3">과제</h4>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-slate-400 mr-3" />
                                <div>
                                  <div className="font-medium text-slate-900">서버리스 API 구현하기</div>
                                  <div className="text-sm text-slate-600">마감일: 2024-04-10</div>
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                미제출
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'progress' && (
                  <div className="space-y-6">
                    {/* 평균 출석률 */}
                    <div className="p-6 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">평균 출석률</h3>
                        <span className="text-2xl font-bold text-blue-600">
                          {courseProgress[selectedCourse].attendanceRate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${courseProgress[selectedCourse].attendanceRate}%` }}
                        />
                      </div>
                    </div>

                    {/* 출석 현황 달력 */}
                    <div className="bg-white rounded-xl border border-slate-200">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">3월 출석 현황</h3>
                        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
                          {/* 요일 헤더 */}
                          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                            <div key={day} className="bg-slate-50 p-2 text-center text-sm font-medium text-slate-600">
                              {day}
                            </div>
                          ))}
                          
                          {/* 달력 날짜 - 첫 주 빈 칸 */}
                          {[0, 0, 0, 0, 1, 2, 3].map((date, index) => (
                            <div key={`empty-${index}`} className="bg-white p-2 min-h-[80px]">
                              {date !== 0 && (
                                <div className="text-sm text-slate-400">{date}</div>
                              )}
                            </div>
                          ))}

                          {/* 달력 날짜 - 수업 있는 날 */}
                          {[4, 5, 6, 7, 8, 9, 10].map((date) => (
                            <div key={date} className="bg-white p-2 min-h-[80px]">
                              <div className="text-sm text-slate-400">{date}</div>
                              {date === 5 && ( // 화요일 - 풀 출석
                                <div className="mt-1 p-1 rounded bg-green-50 border border-green-200 group relative">
                                  <div className="text-xs font-medium text-green-700">출석</div>
                                  <div className="text-xs text-green-600">19:00-21:00</div>
                                  
                                  {/* Hover Tooltip */}
                                  <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-white rounded-lg border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <div className="text-xs space-y-1">
                                      <div className="font-medium text-slate-900">출석 기록</div>
                                      <div className="text-slate-600">입실: 18:55</div>
                                      <div className="text-slate-600">퇴실: 21:00</div>
                                      <div className="text-green-600 font-medium">총 수업 참여: 2시간</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {date === 7 && ( // 목요일
                                <div className="mt-1 p-1 rounded bg-green-50 border border-green-200">
                                  <div className="text-xs font-medium text-green-700">출석</div>
                                  <div className="text-xs text-green-600">19:00-21:00</div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* 달력 날짜 - 두 번째 주 */}
                          {[11, 12, 13, 14, 15, 16, 17].map((date) => (
                            <div key={date} className="bg-white p-2 min-h-[80px]">
                              <div className="text-sm text-slate-400">{date}</div>
                              {date === 12 && ( // 화요일 - 부분 출석
                                <div className="mt-1 p-1 rounded bg-yellow-50 border border-yellow-200 group relative">
                                  <div className="text-xs font-medium text-yellow-700">부분 출석</div>
                                  <div className="text-xs text-yellow-600">19:00-21:00</div>
                                  
                                  {/* Hover Tooltip */}
                                  <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-white rounded-lg border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <div className="text-xs space-y-1">
                                      <div className="font-medium text-slate-900">출석 기록</div>
                                      <div className="text-slate-600">입실: 19:30</div>
                                      <div className="text-slate-600">퇴실: 21:00</div>
                                      <div className="text-yellow-600 font-medium">총 수업 참여: 1시간 30분</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {date === 14 && ( // 목요일
                                <div className="mt-1 p-1 rounded bg-red-50 border border-red-200 group relative">
                                  <div className="text-xs font-medium text-red-700">결석</div>
                                  <div className="text-xs text-red-600">19:00-21:00</div>
                                  
                                  {/* Hover Tooltip */}
                                  <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-white rounded-lg border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <div className="text-xs space-y-1">
                                      <div className="font-medium text-slate-900">출석 기록</div>
                                      <div className="text-red-600 font-medium">❌ 수업 불참</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* 달력 날짜 - 세 번째 주 */}
                          {[18, 19, 20, 21, 22, 23, 24].map((date) => (
                            <div key={date} className="bg-white p-2 min-h-[80px]">
                              <div className="text-sm text-slate-400">{date}</div>
                              {date === 19 && ( // 화요일
                                <div className="mt-1 p-1 rounded bg-green-50 border border-green-200">
                                  <div className="text-xs font-medium text-green-700">출석</div>
                                  <div className="text-xs text-green-600">19:00-21:00</div>
                                </div>
                              )}
                              {date === 21 && ( // 목요일
                                <div className="mt-1 p-1 rounded bg-green-50 border border-green-200">
                                  <div className="text-xs font-medium text-green-700">출석</div>
                                  <div className="text-xs text-green-600">19:00-21:00</div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* 달력 날짜 - 네 번째 주 */}
                          {[25, 26, 27, 28, 29, 30, 31].map((date) => (
                            <div key={date} className="bg-white p-2 min-h-[80px]">
                              <div className="text-sm text-slate-400">{date}</div>
                              {date === 26 && ( // 화요일
                                <div className="mt-1 p-1 rounded bg-slate-50 border border-slate-200">
                                  <div className="text-xs font-medium text-slate-700">예정</div>
                                  <div className="text-xs text-slate-600">19:00-21:00</div>
                                </div>
                              )}
                              {date === 28 && ( // 목요일
                                <div className="mt-1 p-1 rounded bg-slate-50 border border-slate-200">
                                  <div className="text-xs font-medium text-slate-700">예정</div>
                                  <div className="text-xs text-slate-600">19:00-21:00</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 범례 */}
                      <div className="px-6 pb-6 flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded bg-green-50 border border-green-200 mr-2"></div>
                          <span className="text-sm text-slate-600">출석</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200 mr-2"></div>
                          <span className="text-sm text-slate-600">부분 출석</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded bg-red-50 border border-red-200 mr-2"></div>
                          <span className="text-sm text-slate-600">결석</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200 mr-2"></div>
                          <span className="text-sm text-slate-600">예정</span>
                        </div>
                      </div>
                    </div>

                    {/* 수료증 섹션 */}
                    {courseProgress[selectedCourse].isCompleted && (
                      <div className="p-6 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center space-x-4">
                          <Award className="w-8 h-8 text-yellow-500" />
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">수료증</h3>
                            <p className="text-slate-600">축하합니다! 모든 과정을 성공적으로 수료하셨습니다.</p>
                          </div>
                          <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            수료증 다운로드
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        새 노트 작성
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-slate-900">1주차 AWS 기초 개념 정리</h3>
                          <span className="text-sm text-slate-500">2024-03-15</span>
                        </div>
                        <p className="text-slate-600 text-sm line-clamp-2">
                          클라우드 컴퓨팅의 기본 개념과 AWS의 주요 서비스들에 대한 정리...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          #{selectedCourse === 'aws' ? 'AWS클라우드기초' : '네트워크보안심화'}
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        새 게시글 작성
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-slate-900">EC2 인스턴스 생성 시 겪은 문제</h3>
                          <span className="text-sm text-slate-500">2024-03-15</span>
                        </div>
                        <p className="text-slate-600 text-sm line-clamp-2">
                          보안 그룹 설정에서 인바운드 규칙을 잘못 설정해서 발생한 문제 해결 과정 공유합니다...
                        </p>
                        <div className="flex items-center space-x-4 mt-4 text-sm text-slate-500">
                          <span>댓글 3</span>
                          <span>좋아요 5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notices' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 flex items-center">
                            1주차 강의 자료 업로드
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10">
                              New
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">2024-03-15</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-amber-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">EC2 인스턴스 생성 실습</div>
                          <div className="text-sm text-slate-500">마감일: 2024-03-20</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        미제출
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'qna' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">VPC 설정 관련 질문</div>
                          <div className="text-sm text-slate-500 mt-1">2024-03-15</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        답변대기
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage; 