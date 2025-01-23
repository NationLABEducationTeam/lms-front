import { FC, useState } from 'react';
import { Search, Star, ThumbsUp, ThumbsDown, MessageSquare, Trash2 } from 'lucide-react';
import { Input } from '@/components/common/ui/input';
import { Button } from '@/components/common/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";

const reviewsData = [
  {
    id: 1,
    courseName: 'AWS 클라우드 아키텍처',
    studentName: '김철수',
    rating: 5,
    content: '실무에서 바로 적용할 수 있는 내용들이 많아서 매우 유익했습니다. 특히 실습 위주의 커리큘럼이 좋았습니다.',
    date: '2024-03-15',
    likes: 12,
    replies: 3,
    status: 'approved',
  },
  {
    id: 2,
    courseName: 'DevOps 마스터 과정',
    studentName: '이영희',
    rating: 4,
    content: '전반적으로 만족스러웠지만, CI/CD 파트는 조금 더 자세한 설명이 필요할 것 같습니다.',
    date: '2024-03-14',
    likes: 8,
    replies: 2,
    status: 'pending',
  },
  // ... 더미 데이터
];

const AdminReviews: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const filteredReviews = reviewsData.filter(review => {
    const matchesSearch = 
      review.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || review.status === statusFilter;

    const matchesRating = 
      ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
      />
    ));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">강의 후기 관리</h1>
          <p className="text-gray-600 mt-1">수강생들의 강의 후기를 관리합니다.</p>
        </div>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-64">
                  <Input
                    type="text"
                    placeholder="강의명 또는 내용으로 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-900">
                    <SelectValue placeholder="상태 필터" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-gray-900">전체</SelectItem>
                    <SelectItem value="approved" className="text-gray-900">승인됨</SelectItem>
                    <SelectItem value="pending" className="text-gray-900">대기중</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={ratingFilter}
                  onValueChange={setRatingFilter}
                >
                  <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-900">
                    <SelectValue placeholder="평점 필터" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-gray-900">전체 평점</SelectItem>
                    <SelectItem value="5" className="text-gray-900">5점</SelectItem>
                    <SelectItem value="4" className="text-gray-900">4점</SelectItem>
                    <SelectItem value="3" className="text-gray-900">3점</SelectItem>
                    <SelectItem value="2" className="text-gray-900">2점</SelectItem>
                    <SelectItem value="1" className="text-gray-900">1점</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="bg-white border-gray-200 hover:bg-gray-100">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-gray-900">{review.courseName}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {review.studentName} · {new Date(review.date).toLocaleDateString('ko-KR')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 mb-4">{review.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{review.replies}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs
                          ${review.status === 'approved' 
                            ? 'bg-green-900/20 text-green-400'
                            : 'bg-yellow-900/20 text-yellow-400'
                          }`}
                        >
                          {review.status === 'approved' ? '승인됨' : '대기중'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                            승인
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReviews; 