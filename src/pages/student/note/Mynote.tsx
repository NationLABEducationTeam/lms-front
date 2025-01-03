import { FC, useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Textarea } from '@/components/common/ui/textarea';
import { Input } from '@/components/common/ui/input';
import { PenLine, Save, Folder, Plus } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  courseId?: string;
  createdAt: string;
  updatedAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const MyNote: FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: '컴퓨터 비전 1주차 노트',
      content: '오늘 배운 내용:\n1. 이미지 처리 기초\n2. OpenCV 설치 및 환경설정\n3. 그레이스케일 변환 실습',
      courseId: 'CV101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '새로운 노트',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
    setActiveNote(newNote);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!activeNote) return;

    const updatedNotes = notes.map(note =>
      note.id === activeNote.id
        ? { ...activeNote, updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    setIsEditing(false);
    // TODO: S3에 저장하는 로직 추가
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
      {/* 노트 목록 */}
      <motion.div
        className="col-span-3 overflow-y-auto"
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={fadeInUp.transition}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-500" />
                나의 노트
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateNote}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                새 노트
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeNote?.id === note.id
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    setActiveNote(note);
                    setIsEditing(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="font-medium line-clamp-1">{note.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {note.content}
                  </p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 노트 편집기 */}
      <motion.div
        className="col-span-9"
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={{ ...fadeInUp.transition, delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={activeNote?.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setActiveNote(prev =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    placeholder="노트 제목을 입력하세요"
                    className="text-lg font-medium"
                  />
                ) : (
                  <CardTitle>{activeNote?.title || '노트를 선택하세요'}</CardTitle>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeNote && (
                  <>
                    {isEditing ? (
                      <Button
                        variant="default"
                        onClick={handleSaveNote}
                        className="flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        저장
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1"
                      >
                        <PenLine className="w-4 h-4" />
                        편집
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeNote ? (
              isEditing ? (
                <Textarea
                  value={activeNote.content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setActiveNote(prev =>
                      prev ? { ...prev, content: e.target.value } : null
                    )
                  }
                  placeholder="노트 내용을 입력하세요"
                  className="min-h-[calc(100vh-16rem)] resize-none"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap">{activeNote.content}</pre>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-16rem)] text-gray-400">
                왼쪽에서 노트를 선택하거나 새로운 노트를 만드세요
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MyNote;
