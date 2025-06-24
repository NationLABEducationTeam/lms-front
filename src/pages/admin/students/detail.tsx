import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  GraduationCap,
  Clock,
  FileText,
  Award,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';
import { Progress } from '@/components/common/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/common/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/ui/dialog';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Label } from '@/components/common/ui/label';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  getStudentDetail, 
  getStudentNotes, 
  addStudentNote, 
  updateStudentNote, 
  deleteStudentNote,
  StudentDetail,
  StudentNote 
} from '@/services/api/enrollments';

// 진행 상태 배지 컴포넌트
const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    'NOT_STARTED': { label: '시작 전', variant: 'secondary' as const },
    'IN_PROGRESS': { label: '진행 중', variant: 'default' as const },
    'COMPLETED': { label: '완료', variant: 'outline' as const },
    'DROPPED': { label: '중단', variant: 'destructive' as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: 'secondary' as const
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// 성적 표시 컴포넌트
const GradeDisplay: FC<{ score: number; maxScore: number }> = ({ score, maxScore }) => {
  const percentage = (score / maxScore) * 100;
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold ${getGradeColor(percentage)}`}>
        {score}/{maxScore}
      </span>
      <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
    </div>
  );
};

const AdminStudentDetail: FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 노트 관련 상태
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<StudentNote | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchStudentDetail();
      fetchStudentNotes();
    }
  }, [studentId]);

  const fetchStudentDetail = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const data = await getStudentDetail(studentId);
      setStudent(data);
    } catch (error) {
      console.error('학생 정보 조회 실패:', error);
      setError('학생 정보를 불러오는데 실패했습니다.');
      toast.error('학생 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentNotes = async () => {
    if (!studentId) return;
    
    try {
      setNotesLoading(true);
      const data = await getStudentNotes(studentId);
      setNotes(data);
    } catch (error) {
      console.error('학생 노트 조회 실패:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!studentId || !newNoteContent.trim()) return;

    try {
      await addStudentNote(studentId, newNoteContent.trim());
      setNewNoteContent('');
      setIsAddingNote(false);
      await fetchStudentNotes();
      toast.success('노트가 추가되었습니다.');
    } catch (error) {
      console.error('노트 추가 실패:', error);
      toast.error('노트 추가에 실패했습니다.');
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editNoteContent.trim()) return;

    try {
      await updateStudentNote(editingNote.id, editNoteContent.trim());
      setEditingNote(null);
      setEditNoteContent('');
      await fetchStudentNotes();
      toast.success('노트가 수정되었습니다.');
    } catch (error) {
      console.error('노트 수정 실패:', error);
      toast.error('노트 수정에 실패했습니다.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteStudentNote(noteId);
      await fetchStudentNotes();
      toast.success('노트가 삭제되었습니다.');
    } catch (error) {
      console.error('노트 삭제 실패:', error);
      toast.error('노트 삭제에 실패했습니다.');
    }
  };

  const startEditNote = (note: StudentNote) => {
    setEditingNote(note);
    setEditNoteContent(note.content);
  };

  const cancelEditNote = () => {
    setEditingNote(null);
    setEditNoteContent('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
        <p className="text-gray-600 mb-4">{error || '학생 정보를 찾을 수 없습니다.'}</p>
        <Button onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          학생 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/students')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">학생 상세 정보</h1>
            <p className="text-gray-600">학생의 상세 정보와 학습 현황을 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>

      {/* 학생 기본 정보 카드 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{student.name}</h2>
              <p className="text-sm text-gray-600">{student.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">이메일</p>
                <p className="font-medium">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">연락처</p>
                <p className="font-medium">{student.phone || '정보 없음'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">가입일</p>
                <p className="font-medium">
                  {format(new Date(student.created_at), 'yyyy년 MM월 dd일', { locale: ko })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">최근 접속</p>
                <p className="font-medium">
                  {student.last_login 
                    ? format(new Date(student.last_login), 'yyyy년 MM월 dd일', { locale: ko })
                    : '정보 없음'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">수강 과목</TabsTrigger>
          <TabsTrigger value="grades">성적 현황</TabsTrigger>
          <TabsTrigger value="assignments">과제 현황</TabsTrigger>
          <TabsTrigger value="notes">관리자 노트</TabsTrigger>
        </TabsList>

        {/* 수강 과목 탭 */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                수강 과목 ({student.enrolled_courses.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.enrolled_courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">수강 중인 과목이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {student.enrolled_courses.map((course) => (
                    <div key={course.course_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{course.course_title}</h3>
                          <p className="text-sm text-gray-600">강사: {course.instructor_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={course.progress_status || 'NOT_STARTED'} />
                          <Badge variant="outline">
                            {course.enrollment_status === 'ACTIVE' ? '수강중' : '중단'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">진도율</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={course.progress || 0} className="flex-1" />
                            <span className="text-sm font-medium">{course.progress || 0}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">등록일</p>
                          <p className="font-medium">
                            {format(new Date(course.enrolled_at), 'yyyy.MM.dd', { locale: ko })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">최근 학습</p>
                          <p className="font-medium">
                            {course.last_accessed_at 
                              ? format(new Date(course.last_accessed_at), 'yyyy.MM.dd', { locale: ko })
                              : '학습 기록 없음'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 성적 현황 탭 */}
        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                성적 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.grades && student.grades.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>과목명</TableHead>
                      <TableHead>항목</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>제출일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.course_title}</TableCell>
                        <TableCell>{grade.item_title}</TableCell>
                        <TableCell>
                          <GradeDisplay score={grade.score} maxScore={grade.max_score} />
                        </TableCell>
                        <TableCell>
                                                   <Badge variant={grade.status === 'COMPLETED' ? 'outline' : 'secondary'}>
                           {grade.status === 'COMPLETED' ? '완료' : '미완료'}
                         </Badge>
                        </TableCell>
                        <TableCell>
                          {grade.submitted_at 
                            ? format(new Date(grade.submitted_at), 'yyyy.MM.dd HH:mm', { locale: ko })
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">성적 정보가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 과제 현황 탭 */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                과제 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.assignments && student.assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>과목명</TableHead>
                      <TableHead>과제명</TableHead>
                      <TableHead>마감일</TableHead>
                      <TableHead>제출일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.course_title}</TableCell>
                        <TableCell>{assignment.title}</TableCell>
                        <TableCell>
                          {format(new Date(assignment.due_date), 'yyyy.MM.dd HH:mm', { locale: ko })}
                        </TableCell>
                        <TableCell>
                          {assignment.submitted_at 
                            ? format(new Date(assignment.submitted_at), 'yyyy.MM.dd HH:mm', { locale: ko })
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                                                   <Badge variant={
                           assignment.status === 'COMPLETED' ? 'outline' :
                           assignment.status === 'OVERDUE' ? 'destructive' : 'secondary'
                         }>
                           {assignment.status === 'COMPLETED' ? '제출완료' :
                            assignment.status === 'OVERDUE' ? '기한초과' : '미제출'}
                         </Badge>
                        </TableCell>
                                                 <TableCell>
                           {assignment.score !== null && assignment.max_score !== undefined && assignment.max_score !== null ? (
                             <GradeDisplay score={assignment.score ?? 0} maxScore={assignment.max_score} />
                           ) : '-'}
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">과제 정보가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 관리자 노트 탭 */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  관리자 노트 ({notes.length}개)
                </div>
                <Button
                  onClick={() => setIsAddingNote(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  노트 추가
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 노트 추가 폼 */}
              {isAddingNote && (
                <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                  <Label htmlFor="new-note">새 노트 작성</Label>
                  <Textarea
                    id="new-note"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="학생에 대한 노트를 작성하세요..."
                    className="mt-2"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNoteContent('');
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim()}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                  </div>
                </div>
              )}

              {/* 노트 목록 */}
              {notesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <Edit className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">작성된 노트가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      {editingNote?.id === note.id ? (
                        <div>
                          <Textarea
                            value={editNoteContent}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                            rows={3}
                            className="mb-3"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditNote}
                            >
                              <X className="h-4 w-4 mr-1" />
                              취소
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleUpdateNote}
                              disabled={!editNoteContent.trim()}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              저장
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-900 mb-3">{note.content}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              작성자: {note.created_by} • {' '}
                              {format(new Date(note.created_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                              {note.updated_at !== note.created_at && (
                                <span> (수정됨)</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditNote(note)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>노트 삭제</DialogTitle>
                                    <DialogDescription>
                                      이 노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline">취소</Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDeleteNote(note.id)}
                                    >
                                      삭제
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStudentDetail; 