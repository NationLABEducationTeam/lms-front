import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCommunityPosts } from '@/services/api/community';
import { CommunityPost } from '@/types/community';
import { Card } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Users, ChevronRight, Search, MessageSquare, Heart, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/common/ui/input';
import { motion } from 'framer-motion';

const CommunityList: FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getCommunityPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching community posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.content.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
              <p className="mt-1 text-gray-500">
                총 {posts.length}개의 게시글이 있습니다
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="게시글 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button
                onClick={() => navigate('/community/create')}
                className="whitespace-nowrap"
              >
                글쓰기
              </Button>
            </div>
          </div>
        </div>

        {/* 커뮤니티 게시글 목록 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.metadata.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => navigate(`/community/${post.metadata.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {post.metadata.category}
                          </span>
                          <h2 className="text-lg font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                            {post.content.title}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span>{post.metadata.author}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(post.metadata.createdAt), {
                              addSuffix: true,
                              locale: ko
                            })}
                          </span>
                          <span>•</span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.metadata.commentCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.metadata.likeCount || 0}</span>
                            </div>
                          </div>
                        </div>
                        {post.metadata.tags && post.metadata.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-wrap gap-2">
                              {post.metadata.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">등록된 게시글이 없습니다</h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">첫 번째 게시글을 작성해보세요!</p>
            <Button onClick={() => navigate('/community/create')}>
              글쓰기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityList; 