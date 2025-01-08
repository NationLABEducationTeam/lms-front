import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Pin, MessageCircle, Eye, FileText, Plus } from 'lucide-react';
import { Notice } from '@/types/notice';
import { CommunityPost } from '@/types/community';
import { getNotices } from '@/services/api/notices';
import { getCommunityPosts } from '@/services/api/community';
import { toast } from 'sonner';
import { Button } from '@/components/common/ui/button';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const BoardList: FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noticeList, postList] = await Promise.all([
          getNotices(),
          getCommunityPosts()
        ]);
        setNotices(noticeList);
        setCommunityPosts(postList);
      } catch (error) {
        console.error('게시판 목록 조회 실패:', error);
        toast.error('게시판 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNoticeClick = (noticeId: string) => {
    navigate(`/student/${noticeId}`);
  };

  const handleCommunityPostClick = (postId: string) => {
    navigate(`/student/community/${postId}`);
  };

  const handleCreateClick = () => {
    navigate('/student/community/create');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">로딩 중...</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>자유게시판</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 공지사항 */}
      <Card>
        <CardHeader>
          <CardTitle>공지사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                등록된 공지사항이 없습니다.
              </div>
            ) : (
              notices.map((notice, index) => (
                <motion.div
                  key={notice.metadata.id}
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    notice.metadata.isImportant ? 'bg-blue-50' : 'bg-gray-50'
                  } hover:bg-gray-100 transition-colors cursor-pointer group`}
                  onClick={() => handleNoticeClick(notice.metadata.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {notice.metadata.isImportant && (
                          <Pin className="w-4 h-4 text-blue-500" />
                        )}
                        <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                          {notice.content.title}
                        </h3>
                      </div>
                      {notice.content.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notice.content.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{notice.metadata.author}</span>
                        <span>{new Date(notice.metadata.createdAt).toLocaleDateString('ko-KR')}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {notice.metadata.viewCount}
                          </div>
                          {notice.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {notice.attachments.length}
                            </div>
                          )}
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

      {/* 자유게시판 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>자유게시판</CardTitle>
            <span className="text-sm text-gray-500">({communityPosts.length})</span>
          </div>
          <Button onClick={handleCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            글쓰기
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communityPosts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                등록된 게시글이 없습니다.
              </div>
            ) : (
              communityPosts.map((post, index) => (
                <motion.div
                  key={post.metadata.id}
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => handleCommunityPostClick(post.metadata.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                        {post.content.title}
                      </h3>
                      {post.content.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.content.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.metadata.author}</span>
                        <span>{new Date(post.metadata.createdAt).toLocaleDateString('ko-KR')}</span>
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
    </div>
  );
};

export default BoardList; 