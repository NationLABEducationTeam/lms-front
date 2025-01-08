import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { MessageCircle, Eye, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { QnaPost } from '@/types/qna';
import { getQnaPosts } from '@/services/api/qna';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const QnaList: FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<QnaPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postList = await getQnaPosts();
        setPosts(postList);
      } catch (error) {
        console.error('QnA 목록 조회 실패:', error);
        toast.error('QnA 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    navigate(`/student/qna/${postId}`);
  };

  const handleCreateClick = () => {
    navigate('/student/qna/create');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Q&A 게시판</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Q&A 게시판</CardTitle>
        <Button onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          질문하기
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              등록된 질문이 없습니다.
            </div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.metadata.id}
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
                className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => handlePostClick(post.metadata.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                        {post.content.title}
                      </h3>
                      {post.metadata.isAnswered && (
                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                          답변완료
                        </span>
                      )}
                    </div>
                    {post.content.summary && (
                      <p className="text-sm text-gray-500">
                        {post.content.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.metadata.author}</span>
                      <span>{new Date(post.metadata.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.metadata.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.metadata.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QnaList; 