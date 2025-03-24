import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Plus, AlertCircle, Search } from 'lucide-react';
import { Notice } from '@/types/notice';
import { getNotices } from '@/services/api/notices';
import { toast } from 'sonner';
import { Input } from '@/components/common/ui/input';
import { useGetPublicCoursesQuery } from '@/services/api/courseApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NoticeList: FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // 강의 목록 가져오기
  const { data: courses = [] } = useGetPublicCoursesQuery();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const noticeList = await getNotices();
        setNotices(noticeList || []);
        setFilteredNotices(noticeList || []);
      } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        toast.error('공지사항 목록을 불러오는데 실패했습니다.');
        setNotices([]);
        setFilteredNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // 검색어와 과목 필터에 따라 공지사항을 필터링
  useEffect(() => {
    let filtered = [...notices];
    
    // 검색어로 필터링
    if (searchTerm) {
      filtered = filtered.filter(notice => 
        notice.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 과목으로 필터링
    if (selectedCourseId) {
      filtered = filtered.filter(notice => 
        notice.metadata.courseId === selectedCourseId
      );
    }
    
    setFilteredNotices(filtered);
  }, [notices, searchTerm, selectedCourseId]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId === 'all' ? null : courseId);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">공지사항 관리</h1>
          <Button
            onClick={() => navigate('/admin/notices/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 공지사항
          </Button>
        </div>

        {/* 검색 및 필터링 UI */}
        <div className="bg-white/5 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="제목 또는 내용으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          <div className="min-w-[200px]">
            <Select onValueChange={handleCourseChange} defaultValue="all">
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="모든 과목" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="all">모든 과목</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          {loading ? (
            <div className="text-center py-4">로딩 중...</div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              {searchTerm || selectedCourseId ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.metadata.id}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/notices/${notice.metadata.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notice.metadata.isImportant && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <h3 className="text-lg font-medium">{notice.content.title}</h3>
                      </div>
                      {notice.content.summary && (
                        <p className="text-sm text-gray-300 mb-2">{notice.content.summary}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-blue-500/30">
                          {notice.metadata.category}
                        </Badge>
                        {notice.metadata.courseName && (
                          <Badge className="bg-green-500/30">
                            과목: {notice.metadata.courseName}
                          </Badge>
                        )}
                        {notice.metadata.tags.map(tag => (
                          <Badge key={tag} className="bg-gray-500/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">
                        {new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        조회수: {notice.metadata.viewCount}
                      </div>
                    </div>
                  </div>
                  {notice.attachments.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                      첨부파일: {notice.attachments.length}개
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeList; 