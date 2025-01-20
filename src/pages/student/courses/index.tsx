import { FC, useState } from 'react';
import { Bell, FileText, HelpCircle, PlayCircle, BookOpen, Download, Calendar, Video, User } from 'lucide-react';

const StudentCoursesPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'notices' | 'assignments' | 'qna'>('curriculum');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<'aws' | 'network'>('aws');

  const isLiveClassAvailable = selectedCourse === 'aws';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-72 flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">수강 중인 강의</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setSelectedCourse('aws')}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  selectedCourse === 'aws' 
                    ? 'bg-white shadow-lg shadow-blue-100 ring-1 ring-blue-600/10' 
                    : 'bg-white/60 hover:bg-white hover:shadow-md hover:shadow-slate-100'
                }`}
              >
                <div className="font-medium text-slate-900">AWS 클라우드 기초</div>
                <div className="text-sm mt-1 text-slate-500 flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  <span>김강사</span>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    <Calendar className="w-3 h-3 mr-1" />
                    다음 수업: 오늘 19:00
                  </span>
                </div>
              </button>
              <button 
                onClick={() => setSelectedCourse('network')}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  selectedCourse === 'network' 
                    ? 'bg-white shadow-lg shadow-blue-100 ring-1 ring-blue-600/10' 
                    : 'bg-white/60 hover:bg-white hover:shadow-md hover:shadow-slate-100'
                }`}
              >
                <div className="font-medium text-slate-900">네트워크 보안 심화</div>
                <div className="text-sm mt-1 text-slate-500 flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  <span>이교수</span>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    <Calendar className="w-3 h-3 mr-1" />
                    다음 수업: 3월 25일 15:00
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm shadow-slate-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {selectedCourse === 'aws' ? 'AWS 클라우드 기초' : '네트워크 보안 심화'}
                  </h1>
                  <p className="mt-2 text-slate-600 text-lg">
                    {selectedCourse === 'aws' 
                      ? 'AWS 클라우드의 기본 개념과 주요 서비스를 학습합니다.'
                      : '기업 네트워크 보안의 핵심 개념과 실무 적용 방법을 학습합니다.'}
                  </p>
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

              {/* Tabs */}
              <div className="border-b border-slate-200">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className={`pb-4 flex items-center space-x-2 transition-colors ${
                      activeTab === 'curriculum'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">커리큘럼</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notices')}
                    className={`pb-4 flex items-center space-x-2 transition-colors ${
                      activeTab === 'notices'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">공지사항</span>
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 text-xs font-medium ring-1 ring-inset ring-red-600/10">
                      N
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`pb-4 flex items-center space-x-2 transition-colors ${
                      activeTab === 'assignments'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">과제</span>
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium ring-1 ring-inset ring-amber-600/10">
                      2
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('qna')}
                    className={`pb-4 flex items-center space-x-2 transition-colors ${
                      activeTab === 'qna'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">질의응답</span>
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium ring-1 ring-inset ring-blue-600/10">
                      1
                    </span>
                  </button>
                </div>
              </div>

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