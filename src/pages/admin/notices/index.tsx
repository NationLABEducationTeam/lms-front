import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Notice } from '@/types/notice';
import { getNotices, deleteNotice } from '@/services/api/notices';
import { toast } from 'sonner';
import { Input } from '@/components/common/ui/input';
import { useGetPublicCoursesQuery } from '@/services/api/courseApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/ui/table';
import { getQnaPosts, deleteQnaPost } from '@/services/api/qna';
import { getCommunityPosts } from '@/services/api/community';
import { QnaPost } from '@/types/qna';
import { CommunityPost } from '@/types/community';

type Post = Notice | QnaPost | CommunityPost;

// Type guards to check post type
function isNotice(post: Post): post is Notice {
    return 'metadata' in post && 'isImportant' in post.metadata;
}

function isQnaPost(post: Post): post is QnaPost {
    return 'metadata' in post && 'status' in post.metadata && !isNotice(post);
}

function isCommunityPost(post: Post): post is CommunityPost {
    return 'metadata' in post && !isNotice(post) && !isQnaPost(post);
}

// Helper functions to safely access properties from different post types
const getPostId = (post: Post): string => {
    if ('metadata' in post) return post.metadata.id;
    return (post as any).id;
};
const getPostTitle = (post: Post): string => {
    if ('content' in post) return post.content.title;
    return (post as any).title;
};
const getAuthor = (post: Post): string => {
    if ('metadata' in post) return post.metadata.author;
    return (post as any).author || '관리자';
};
const getCreatedAt = (post: Post): string => {
    if ('metadata' in post) return post.metadata.createdAt;
    return (post as any).createdAt;
};
const getViews = (post: Post): number | string => {
    if ('metadata' in post) return post.metadata.viewCount;
    return (post as any).views ?? '-';
};

const boardConfig = {
  notice: {
    title: '공지사항 관리',
    description: '공지사항을 관리하고 새 소식을 전달합니다.',
    fetch: getNotices,
    delete: deleteNotice,
    createPath: '/admin/notices/create',
    detailPath: (id: string) => `/admin/notices/${id}`,
  },
  qna: {
    title: 'Q&A 관리',
    description: '학생들의 질문에 답변하고 관리합니다.',
    fetch: getQnaPosts,
    delete: deleteQnaPost,
    createPath: null,
    detailPath: (id: string) => `/admin/qna/${id}`,
  },
  community: {
    title: '커뮤니티 관리',
    description: '자유게시판의 게시글을 관리합니다.',
    fetch: getCommunityPosts,
    delete: null, // 커뮤니티 글은 관리자가 임의 삭제하지 않을 수 있음
    createPath: null,
    detailPath: (id: string) => `/admin/community/${id}`,
  },
};

interface AdminBoardProps {
  boardType: 'notice' | 'qna' | 'community';
}

const AdminBoard: FC<AdminBoardProps> = ({ boardType }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: courses = [] } = useGetPublicCoursesQuery();

  const currentConfig = boardConfig[boardType];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await currentConfig.fetch();
        setPosts(data || []);
      } catch (error) {
        console.error('게시글을 불러오는 데 실패했습니다.', error);
        toast.error('게시글 목록을 불러오는 데 실패했습니다.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [boardType, currentConfig]);

  const handleDelete = async (id: string) => {
    if (!currentConfig.delete) return;
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await currentConfig.delete(id);
        setPosts(posts.filter((post) => getPostId(post) !== id));
        toast.success('게시글이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('게시글 삭제에 실패했습니다.', error);
        toast.error('게시글 삭제에 실패했습니다.');
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    const titleMatch = getPostTitle(post).toLowerCase().includes(searchTerm.toLowerCase());
    
    // 공지사항이고 과목 필터가 선택된 경우
    if (boardType === 'notice' && selectedCourseId) {
        if (isNotice(post)) {
            return titleMatch && post.metadata.courseId === selectedCourseId;
        }
        return false;
    }
    
    return titleMatch;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{currentConfig.title}</h1>
          <p className="text-gray-600 mt-1">{currentConfig.description}</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Input
                  type="text"
                  placeholder="제목으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            
              {boardType === 'notice' && (
                <Select onValueChange={(value) => setSelectedCourseId(value === 'all' ? null : value)}>
                  <SelectTrigger className="w-[200px] bg-white border-gray-200 text-gray-900">
                    <SelectValue placeholder="모든 과목" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="all">모든 과목</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {currentConfig.createPath && (
              <Button onClick={() => navigate(currentConfig.createPath!)} className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300">
                <Plus className="w-4 h-4 mr-2" />
                새 글 작성
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-gray-200">
                  <TableHead className="text-gray-600">제목</TableHead>
                  <TableHead className="text-gray-600">작성자</TableHead>
                  <TableHead className="text-gray-600">작성일</TableHead>
                  <TableHead className="text-gray-600">조회수</TableHead>
                  <TableHead className="text-gray-600">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      게시글이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => {
                    const postId = getPostId(post);
                    return (
                      <TableRow key={postId} className="hover:bg-gray-50 border-gray-200">
                        <TableCell className="font-medium text-gray-900">
                          {currentConfig.detailPath ? (
                            <span
                              onClick={() => navigate(currentConfig.detailPath!(postId))}
                              className="cursor-pointer hover:underline"
                            >
                              {getPostTitle(post)}
                            </span>
                          ) : (
                            getPostTitle(post)
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">{getAuthor(post)}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(getCreatedAt(post)).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-gray-600">{getViews(post)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {currentConfig.detailPath && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(currentConfig.detailPath!(postId))}
                                className="text-gray-500 hover:text-gray-800"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {currentConfig.delete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(postId)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBoard;