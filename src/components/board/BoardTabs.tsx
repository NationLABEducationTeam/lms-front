import { FC } from 'react';
import { Typography, theme } from 'antd';
import { BoardList } from './BoardList';

const { Title } = Typography;
const { useToken } = theme;

interface BoardTabsProps {
  onPostClick: (boardType: 'notice' | 'community' | 'qna', postId: string) => void;
  onCreateClick: (boardType: 'community' | 'qna') => void;
}

export const BoardTabs: FC<BoardTabsProps> = ({ onPostClick, onCreateClick }) => {
  const { token } = useToken();

  return (
    <div style={{ padding: token.paddingLG }}>
      <Title level={4} style={{ marginBottom: token.marginMD }}>게시판</Title>
      <div style={{
        background: token.colorBgContainer,
        padding: token.paddingLG,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary
      }}>
        <BoardList 
          onPostClick={onPostClick}
          onCreateClick={onCreateClick}
        />
      </div>
    </div>
  );
}; 