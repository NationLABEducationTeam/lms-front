import { FC, useState } from 'react';
import { useGetDashboardSummaryQuery } from '@/services/api/zoomApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { Badge } from '@/components/common/ui/badge';
import { Button } from '@/components/common/ui/button';
import { Video, Users, Calendar, Clock, ExternalLink, BookOpen } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table';

// Skeleton 컴포넌트 정의
const Skeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const MonitoringPage: FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery();

  const handleRefresh = () => {
    refetch();
  };

  const renderActiveMeetings = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>데이터를 불러오는 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh}>다시 시도</Button>
          </CardContent>
        </Card>
      );
    }

    if (!data?.activeMeetings?.length) {
      return (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>진행 중인 수업 없음</CardTitle>
            <CardDescription>현재 진행 중인 실시간 수업이 없습니다.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {data.activeMeetings.map((meeting) => (
          <Card key={meeting.id} className="overflow-hidden border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{meeting.topic}</CardTitle>
                  <CardDescription>
                    시작: {format(new Date(meeting.startTime), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  </CardDescription>
                  {meeting.course_id && 
                    <CardDescription className="mt-1">
                      강의: {meeting.course_title || '연결된 강의 없음'}
                    </CardDescription>
                  }
                </div>
                <Badge className="bg-green-500">진행 중</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Users className="h-4 w-4" />
                  <span>참가자: {meeting.participants?.length || 0}명</span>
                </div>
                <a 
                  href={`https://zoom.us/j/${meeting.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Zoom에서 보기
                </a>
              </div>

              {meeting.participants && meeting.participants.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>참여 지속 시간</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meeting.participants.map((participant, index) => (
                        <TableRow key={`${meeting.id}-participant-${index}`}>
                          <TableCell>{participant.name}</TableCell>
                          <TableCell>{participant.email}</TableCell>
                          <TableCell>
                            {(() => {
                              const joinTime = new Date(participant.joinTime);
                              const now = new Date();
                              const diffMs = now.getTime() - joinTime.getTime();
                              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                              const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                              
                              let durationText = '';
                              if (diffHours > 0) {
                                durationText = `${diffHours}시간 ${diffMinutes}분 동안 참여`;
                              } else {
                                durationText = `${diffMinutes}분 동안 참여`;
                              }
                              
                              const joinTimeText = format(joinTime, 'HH:mm', { locale: ko });
                              
                              return (
                                <div>
                                  <div className="font-medium">{durationText}</div>
                                  <div className="text-xs text-gray-500">{joinTimeText}부터 참여</div>
                                </div>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">참가자 정보를 불러올 수 없습니다.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderUpcomingMeetings = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>데이터를 불러오는 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh}>다시 시도</Button>
          </CardContent>
        </Card>
      );
    }

    if (!data?.upcomingMeetings?.length) {
      return (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>예정된 수업 없음</CardTitle>
            <CardDescription>예정된 실시간 수업이 없습니다.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {data.upcomingMeetings.map((meeting) => (
          <Card key={meeting.id} className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{meeting.topic}</CardTitle>
                  <CardDescription>
                    시작: {format(new Date(meeting.startTime), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  </CardDescription>
                </div>
                <Badge className="bg-blue-500">예정됨</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4" />
                <span>소요 시간: {meeting.duration}분</span>
              </div>
              <a 
                href={meeting.join_url || `https://zoom.us/j/${meeting.id}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Zoom에서 보기
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRecentMeetings = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>데이터를 불러오는 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh}>다시 시도</Button>
          </CardContent>
        </Card>
      );
    }

    if (!data?.recentMeetings?.length) {
      return (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>최근 종료된 수업 없음</CardTitle>
            <CardDescription>최근 7일 이내에 종료된 수업이 없습니다.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {data.recentMeetings.map((meeting) => (
          <Card key={meeting.id} className="overflow-hidden border-l-4 border-l-gray-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{meeting.topic}</CardTitle>
                  <CardDescription>
                    {format(new Date(meeting.startTime), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })} ~ 
                    {format(new Date(meeting.endTime), 'HH:mm', { locale: ko })}
                  </CardDescription>
                </div>
                <Badge variant="outline">종료됨</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>참가자: {meeting.participants || 0}명</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">수업 모니터링</h1>
          <p className="text-gray-600">실시간 수업 현황을 모니터링합니다.</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <span>새로고침</span>
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>진행 중인 수업</span>
                {data?.activeMeetings && data.activeMeetings.length > 0 && (
                  <Badge className="ml-2 bg-green-500">{data.activeMeetings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>예정된 수업</span>
                {data?.upcomingMeetings && data.upcomingMeetings.length > 0 && (
                  <Badge className="ml-2 bg-blue-500">{data.upcomingMeetings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>최근 종료된 수업</span>
                {data?.recentMeetings && data.recentMeetings.length > 0 && (
                  <Badge className="ml-2" variant="outline">{data.recentMeetings.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === 'active' && (
              <div className="space-y-4">
                {renderActiveMeetings()}
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {renderUpcomingMeetings()}
              </div>
            )}

            {activeTab === 'recent' && (
              <div className="space-y-4">
                {renderRecentMeetings()}
              </div>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MonitoringPage; 