import React, { FC, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Statistic, Spin, Empty, Button, Space, Divider, Badge } from 'antd';
import { 
  PenLine, Film, MessageSquare, Clock, Edit2, Trash2, Play, ChevronDown, BookOpen 
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllNotesQuery } from '@/services/api/courseApi';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/config/api';

const NotesPanel: FC = () => {
  const { data: notesData } = useGetAllNotesQuery();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const toggleVideo = (videoId: string) => {
    setExpandedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const toggleNote = (noteId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const filteredNotes = useMemo(() => {
    if (!notesData?.data) return [];
    
    let courses = notesData.data;

    // 검색어로 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      courses = courses.map(course => ({
        ...course,
        videos: course.videos.map(video => ({
          ...video,
          notes: video.notes.filter(note => 
            note.content.toLowerCase().includes(term) ||
            (video.videoTitle || '').toLowerCase().includes(term)
          )
        })).filter(video => video.notes.length > 0)
      })).filter(course => course.videos.length > 0);
    }

    return courses;
  }, [notesData, searchTerm]);

  const handleVideoClick = (courseId: string, videoId: string, weekNumber: number, timestamp: number) => {
    if (!weekNumber) {
      console.error('주차 정보가 없습니다:', { courseId, videoId, weekNumber, timestamp });
      toast.error('동영상을 재생할 수 없습니다. 주차 정보가 없습니다.');
      return;
    }

    navigate(`/mycourse/${courseId}/week/${weekNumber}/video/${encodeURIComponent(videoId)}`, {
      state: {
        videoUrl: `${getApiUrl('')}/videos/${courseId}/${weekNumber}/${videoId}`,
        title: videoId.replace('.m3u8', ''),
        courseId,
        timestamp,
        weekNumber,
        weekTitle: `${weekNumber}주차 강의`
      }
    });
  };

  if (!notesData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 통계 영역 */}
      <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="노트 내용이나 영상 제목으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {filteredNotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50">
              <Statistic
                title="전체 노트"
                value={filteredNotes.reduce((acc, course) => acc + course.totalNotes, 0)}
                prefix={<PenLine className="w-4 h-4" />}
              />
            </Card>
            <Card className="bg-purple-50">
              <Statistic
                title="영상 수"
                value={filteredNotes.reduce((acc, course) => acc + course.videoCount, 0)}
                prefix={<Film className="w-4 h-4" />}
              />
            </Card>
            <Card className="bg-green-50">
              <Statistic
                title="최근 업데이트"
                value={new Date(filteredNotes[0]?.lastUpdated).toLocaleDateString()}
                prefix={<Clock className="w-4 h-4" />}
              />
            </Card>
          </div>
        )}
      </div>

      {/* 노트 목록 */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">노트가 없습니다</p>
          <p className="text-sm text-gray-500">
            {searchTerm ? '검색 조건을 변경해보세요.' : '강의를 시청하면서 노트를 작성해보세요.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((course) => (
            <div
              key={course.courseId}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
            >
              {/* 과목 헤더 */}
              <button
                onClick={() => toggleCourse(course.courseId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">{course.courseTitle}</h3>
                  <Badge 
                    count={course.totalNotes}
                    className="bg-blue-100 text-blue-600 border-blue-100"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    마지막 업데이트: {new Date(course.lastUpdated).toLocaleDateString()}
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      expandedCourses.has(course.courseId) ? "transform rotate-180" : ""
                    )} 
                  />
                </div>
              </button>

              {/* 영상별 노트 목록 */}
              {expandedCourses.has(course.courseId) && (
                <div className="border-t border-gray-100">
                  {course.videos.map((video) => (
                    <div key={video.videoId} className="border-b border-gray-100 last:border-b-0">
                      {/* 영상 헤더 */}
                      <button
                        onClick={() => toggleVideo(video.videoId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Film className="w-4 h-4 text-purple-600" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-gray-900">
                              {video.weekNumber}주차 - {(video.videoTitle || '').replace('.m3u8', '')}
                            </span>
                            {video.weekTitle && (
                              <span className="text-xs text-gray-500">{video.weekTitle}</span>
                            )}
                          </div>
                          <Badge 
                            count={video.noteCount}
                            className="bg-purple-100 text-purple-600 border-purple-100"
                          />
                        </div>
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            expandedVideos.has(video.videoId) ? "transform rotate-180" : ""
                          )} 
                        />
                      </button>

                      {/* 노트 목록 */}
                      {expandedVideos.has(video.videoId) && (
                        <div className="p-4 space-y-3">
                          {video.notes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <Button
                                    type="link"
                                    size="small"
                                    className="text-blue-600 hover:text-blue-700 p-0"
                                    onClick={() => toggleNote(note.id)}
                                  >
                                    {note.formattedTime}
                                  </Button>
                                </div>
                                <Space split={<Divider type="vertical" />}>
                                  <span className="text-xs text-gray-500">
                                    작성: {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                  {note.updatedAt !== note.createdAt && (
                                    <span className="text-xs text-gray-500">
                                      수정: {new Date(note.updatedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </Space>
                              </div>
                              <div className="mb-3">
                                <p className={cn(
                                  "text-sm text-gray-700",
                                  expandedNotes.has(note.id) ? '' : 'line-clamp-2'
                                )}>
                                  {note.content}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button
                                  type="text"
                                  size="small"
                                  onClick={() => toggleNote(note.id)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  {expandedNotes.has(note.id) ? '접기' : '더보기'}
                                </Button>
                                <Space>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Edit2 className="w-4 h-4" />}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    수정
                                  </Button>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Trash2 className="w-4 h-4" />}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    삭제
                                  </Button>
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => {
                                      console.log('비디오 데이터:', { courseId: course.courseId, videoId: video.videoId, weekNumber: video.weekNumber, timestamp: note.timestamp });
                                      handleVideoClick(course.courseId, video.videoId, video.weekNumber, note.timestamp);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    동영상 보기
                                  </Button>
                                </Space>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPanel; 