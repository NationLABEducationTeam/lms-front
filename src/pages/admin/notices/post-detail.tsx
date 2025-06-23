import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { AlertCircle, ArrowLeft, Download, Pencil, Trash } from 'lucide-react';
import { Notice } from '@/types/notice';
import { getNotice, deleteNotice } from '@/services/api/notices';
import { getQnaPost, deleteQnaPost } from '@/services/api/qna';
import { getCommunityPost } from '@/services/api/community';
import { QnaPost } from '@/types/qna';
import { CommunityPost } from '@/types/community';
import { toast } from 'sonner';

type PostDetail = Notice | QnaPost | CommunityPost;
type BoardType = 'notice' | 'qna' | 'community';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt?: string; // Optional as it might not exist in all post types
}

const postDetailConfig: Record<BoardType, {
  fetch: (id: string) => Promise<any>;
  delete?: (id: string) => Promise<void>;
  listPath: string;
  editPath?: (id: string) => string;
}> = {
  notice: {
    fetch: getNotice,
    delete: deleteNotice,
    listPath: '/admin/notices',
    editPath: (id) => `/admin/notices/edit/${id}`,
  },
  qna: {
    fetch: getQnaPost,
    delete: deleteQnaPost,
    listPath: '/admin/qna',
  },
  community: {
    fetch: getCommunityPost,
    listPath: '/admin/community',
  },
};

// Helper to check if a post is a Notice
function isNotice(post: PostDetail): post is Notice {
  return 'metadata' in post && 'isImportant' in post.metadata;
}

const AdminPostDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [boardType, setBoardType] = useState<BoardType | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/notices/')) setBoardType('notice');
    else if (path.startsWith('/admin/qna/')) setBoardType('qna');
    else if (path.startsWith('/admin/community/')) setBoardType('community');
  }, [location.pathname]);

  useEffect(() => {
    if (!id || !boardType) return;

    const config = postDetailConfig[boardType];

    const fetchPost = async () => {
      setLoading(true);
      try {
        const postData = await config.fetch(id);
        setPost(postData);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        toast.error('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, boardType]);

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!id || !boardType || !window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    const config = postDetailConfig[boardType];
    if (!config.delete) return;

    try {
      setIsDeleting(true);
      await config.delete(id);
      toast.success('게시글이 삭제되었습니다.');
      navigate(config.listPath);
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      toast.error('게시글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !boardType) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-4">
          로딩 중...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-4">
          게시글을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const config = postDetailConfig[boardType];

  const getAttachments = (): Attachment[] => {
    if ('attachments' in post && Array.isArray(post.attachments)) {
        return post.attachments as Attachment[];
    }
    return [];
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(config.listPath)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {/* 헤더 */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {isNotice(post) && post.metadata.isImportant && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{post.content.title}</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div>작성자: {post.metadata.author}</div>
              <div>
                작성일: {new Date(post.metadata.createdAt).toLocaleDateString('ko-KR')}
              </div>
              <div>조회수: {post.metadata.viewCount}</div>
            </div>
          </div>

          {/* 메타데이터 */}
          {isNotice(post) && (
            <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                <Badge>
                    {post.metadata.category}
                </Badge>
                {post.metadata.courseName && (
                    <Badge variant="secondary">
                    과목: {post.metadata.courseName}
                    </Badge>
                )}
                {post.metadata.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                    {tag}
                    </Badge>
                ))}
                </div>
            </div>
          )}
          
          {post.content.summary && (
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 mb-6 border border-gray-200">
              {post.content.summary}
            </div>
          )}


          {/* 본문 */}
          <div className="prose max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: (post.content as any).content || (post.content as any).body }}
          />

          {/* 첨부파일 */}
          {getAttachments().length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium text-gray-800 mb-2">첨부파일</h2>
              <div className="space-y-2">
                {getAttachments().map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleDownload(file.url, file.name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 작업 버튼 */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            {config.editPath && (
                <Button
                    variant="outline"
                    onClick={() => navigate(config.editPath!(post.metadata.id))}
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    수정
                </Button>
            )}
            {config.delete && (
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <Trash className="w-4 h-4 mr-2" />
                    {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPostDetail;