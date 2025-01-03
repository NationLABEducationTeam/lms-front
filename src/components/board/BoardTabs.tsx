import { FC } from 'react';
import { Typography, theme } from 'antd';
import { BoardList } from './BoardList';

const { Title } = Typography;
const { useToken } = theme;

export const BoardTabs: FC = () => {
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
        <BoardList />
      </div>
    </div>
  );
}; 