import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { Board, BoardFormData } from '@/types/board';

export const boardApi = createApi({
  reducerPath: 'boardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Board'],
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      query: () => '/boards',
      providesTags: ['Board'],
    }),
    
    createBoard: builder.mutation<Board, BoardFormData>({
      query: (boardData) => ({
        url: '/boards',
        method: 'POST',
        body: boardData,
      }),
      invalidatesTags: ['Board'],
    }),
    
    updateBoard: builder.mutation<Board, { id: string; boardData: BoardFormData }>({
      query: ({ id, boardData }) => ({
        url: `/boards/${id}`,
        method: 'PUT',
        body: boardData,
      }),
      invalidatesTags: ['Board'],
    }),
    
    deleteBoard: builder.mutation<void, string>({
      query: (id) => ({
        url: `/boards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Board'],
    }),
    
    toggleStatus: builder.mutation<Board, { id: string; status: 'active' | 'inactive' }>({
      query: ({ id, status }) => ({
        url: `/boards/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Board'],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useToggleStatusMutation,
} = boardApi;

// 백엔드 연결 전 임시 데이터
export const mockBoards: Board[] = [
  {
    id: '1',
    name: '자유게시판',
    category: 'general',
    postsCount: 150,
    lastPost: '2024-03-15',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
    description: '학생들이 자유롭게 대화할 수 있는 공간입니다.'
  },
  {
    id: '2',
    name: '질문과 답변',
    category: 'qna',
    postsCount: 89,
    lastPost: '2024-03-14',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-14T00:00:00Z',
    description: '수업 관련 질문을 할 수 있는 게시판입니다.'
  },
  {
    id: '3',
    name: '스터디 모집',
    category: 'study',
    postsCount: 45,
    lastPost: '2024-03-13',
    status: 'inactive',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-13T00:00:00Z',
    description: '스터디 그룹을 구성하고 모집하는 게시판입니다.'
  },
  {
    id: '4',
    name: '공지사항',
    category: 'notice',
    postsCount: 32,
    lastPost: '2024-03-12',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-12T00:00:00Z',
    description: '중요한 공지사항이 게시되는 공간입니다.'
  },
  {
    id: '5',
    name: '과제 제출',
    category: 'general',
    postsCount: 21,
    lastPost: '2024-03-10',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    description: '과제 제출 및 질문을 위한 게시판입니다.'
  }
];

// 백엔드 연결 전 임시 데이터 제공 함수
export const getMockBoards = (): Promise<Board[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBoards);
    }, 500);
  });
};

export const getMockBoardById = (id: string): Promise<Board | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const board = mockBoards.find(b => b.id === id);
      resolve(board);
    }, 500);
  });
}; 