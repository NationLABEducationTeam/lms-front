import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { MessageCircle, Eye, FileText, Plus } from 'lucide-react';
import { CommunityPost } from '@/types/community';
import { getCommunityPosts } from '@/services/api/community';
import { toast } from 'sonner';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const CommunityList: FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postList = await getCommunityPosts();
        setPosts(postList);
      } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
        toast.error('게시글 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    navigate(`/community/${postId}`);
  };

  const handleCreateClick = () => {
    navigate('/board/community/create');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>자유게시판</CardTitle>
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
        <CardTitle>자유게시판</CardTitle>
        <Button onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          글쓰기
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              등록된 게시글이 없습니다.
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
                    </div>
                    {post.content.summary && (
                      <p className="text-sm text-gray-500">
                        {post.content.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.metadata.author}</span>
                      <span>{new Date(post.metadata.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.metadata.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.metadata.commentCount}</span>
                    </div>
                    {post.attachments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{post.attachments.length}</span>
                      </div>
                    )}
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

export default CommunityList; 