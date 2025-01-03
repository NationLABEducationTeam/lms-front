import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Pin, MessageCircle, Eye } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  isPinned: boolean;
  views: number;
  comments: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const BoardList = () => {
  const posts: Post[] = [
    {
      id: 1,
      title: '[공지] 2024학년도 1학기 중간고사 안내',
      content: '중간고사 일정 및 시험 범위를 안내드립니다.',
      author: '관리자',
      date: '2024.03.10',
      isPinned: true,
      views: 245,
      comments: 12
    },
    {
      id: 2,
      title: '[과제] 컴퓨터 비전 프로젝트 제출 안내',
      content: '프로젝트 제출 방법 및 마감일을 안내드립니다.',
      author: '김교수',
      date: '2024.03.09',
      isPinned: true,
      views: 189,
      comments: 8
    },
    {
      id: 3,
      title: '수업 자료 관련 질문이 있습니다.',
      content: '3주차 강의 자료 중 이해가 안 되는 부분이 있어서 질문드립니다.',
      author: '홍길동',
      date: '2024.03.08',
      isPinned: false,
      views: 42,
      comments: 3
    },
    // ... 더 많은 게시글
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>게시판</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
              className={`p-4 rounded-lg ${
                post.isPinned ? 'bg-blue-50' : 'bg-gray-50'
              } hover:bg-gray-100 transition-colors cursor-pointer group`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <Pin className="w-4 h-4 text-blue-500" />
                    )}
                    <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BoardList; 