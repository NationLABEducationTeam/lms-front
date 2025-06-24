import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Plus, BarChart2, Link2, Edit, Trash2, MoreVertical, Search, MessageSquare, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/common/ui/badge';
import { Input } from '@/components/common/ui/input';

// 더미 데이터
const DUMMY_REVIEWS = [
  {
    id: 'review-001',
    title: 'MSA 기반 대규모 커머스 프로젝트 과정 후기',
    courseId: 'course-123',
    courseTitle: 'MSA 기반 대규모 커머스 프로젝트',
    responses: 128,
    createdAt: '2024-05-10T09:00:00',
    status: 'active',
  },
  {
    id: 'review-002',
    title: '쿠버네티스 마스터 클래스 만족도 조사',
    courseId: 'course-456',
    courseTitle: '쿠버네티스 마스터 클래스',
    responses: 76,
    createdAt: '2024-04-22T14:20:00',
    status: 'active',
  },
  {
    id: 'review-003',
    title: '신입 프론트엔드 개발자 양성 과정 최종 피드백',
    courseId: 'course-789',
    courseTitle: '신입 프론트엔드 개발자 양성 과정',
    responses: 0,
    createdAt: '2024-03-15T11:30:00',
    status: 'draft',
  },
];

const AdminReviewsPage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReviews = DUMMY_REVIEWS.filter(review =>
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">후기 관리</h1>
            <p className="text-gray-500">생성된 후기 폼 목록 및 관리를 할 수 있습니다.</p>
          </div>
          <Button onClick={() => navigate('/admin/reviews/create')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            새 후기 폼 만들기
          </Button>
        </div>
        
        {/* 검색 */}
        <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="후기 폼 제목 또는 강의명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full max-w-sm"
              />
            </div>
          </div>


        {/* 후기 폼 목록 */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={review.status === 'active' ? 'default' : 'secondary'}>
                      {review.status === 'active' ? '진행중' : '준비중'}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-800">{review.title}</h3>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{review.responses}개 답변</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>생성일: {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" onClick={() => navigate(`/admin/reviews/${review.id}/results`)}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    결과 보기
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/reviews/${review.id}`)}>
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/reviews/${review.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
           {filteredReviews.length === 0 && (
            <div className="text-center py-12">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
