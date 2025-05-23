import React, { FC } from 'react';
import { Tabs, Empty } from 'antd';
import {
  BellOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Notice } from '@/types/notice';
import { QnaPost } from '@/types/qna';
import { CommunityPost } from '@/types/community';

const { TabPane } = Tabs;

interface BoardTabsProps {
  notices: Notice[];
  qnaPosts: QnaPost[];
  communityPosts: CommunityPost[];
}

const BoardTabs: FC<BoardTabsProps> = ({ notices, qnaPosts, communityPosts }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <Tabs 
        defaultActiveKey="notice" 
        size="large"
        className="dashboard-tabs" 
        tabBarStyle={{
          margin: '0 16px',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        {/* 공지사항 탭 */}
        <TabPane 
          tab={
            <div className="flex items-center space-x-2 px-1">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <BellOutlined className="text-dashboard-accent" />
              </div>
              <span>공지사항</span>
            </div>
          } 
          key="notice"
        >
          <div className="p-4">
            {notices.length === 0 ? (
              <Empty description="공지사항이 없습니다" />
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <div 
                    key={notice.metadata.id}
                    onClick={() => navigate(`/notices/${notice.metadata.id}`)}
                    className="group p-4 border border-gray-100 hover:border-dashboard-primary rounded-xl cursor-pointer transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                          {notice.content.title}
                        </h4>
                        {notice.metadata.isImportant && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                            중요
                          </span>
                        )}
                      </div>
                      
                      <button className="text-dashboard-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        자세히 보기
                      </button>
                    </div>
                    
                    <div className="flex space-x-3 text-sm">
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                        {notice.metadata.category}
                      </span>
                      <span className="text-dashboard-text-secondary">
                        {new Date(notice.metadata.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-6">
              <button 
                onClick={() => navigate('/notices')}
                className="text-dashboard-primary hover:text-dashboard-secondary inline-flex items-center space-x-1 transition-colors"
              >
                <span>전체 공지사항 보기</span>
                <RightOutlined />
              </button>
            </div>
          </div>
        </TabPane>

        {/* Q&A 탭 */}
        <TabPane 
          tab={
            <div className="flex items-center space-x-2 px-1">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <QuestionCircleOutlined className="text-dashboard-secondary" />
              </div>
              <span>Q&A</span>
            </div>
          } 
          key="qna"
        >
          <div className="p-4">
            {qnaPosts.length === 0 ? (
              <Empty description="Q&A 게시물이 없습니다" />
            ) : (
              <div className="space-y-3">
                {qnaPosts.slice(0, 3).map((post) => (
                  <div 
                    key={post.metadata.id}
                    onClick={() => navigate(`/qna/${post.metadata.id}`)}
                    className="group p-4 border border-gray-100 hover:border-dashboard-primary rounded-xl cursor-pointer transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                          {post.content.title}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${post.metadata.status === 'resolved' ? 
                            'bg-green-100 text-green-600' : 
                            'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {post.metadata.status === 'resolved' ? '해결됨' : '미해결'}
                        </span>
                      </div>
                      
                      <button className="text-dashboard-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        자세히 보기
                      </button>
                    </div>
                    
                    <div className="flex space-x-3 text-sm">
                      <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                        {post.metadata.tags?.[0] || '질문'}
                      </span>
                      <span className="text-dashboard-text-secondary">
                        {new Date(post.metadata.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-6">
              <button 
                onClick={() => navigate('/qna')}
                className="text-dashboard-primary hover:text-dashboard-secondary inline-flex items-center space-x-1 transition-colors"
              >
                <span>전체 Q&A 보기</span>
                <RightOutlined />
              </button>
            </div>
          </div>
        </TabPane>

        {/* 커뮤니티 탭 */}
        <TabPane 
          tab={
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
                <TeamOutlined className="text-dashboard-info" />
              </div>
              <span>커뮤니티</span>
            </div>
          } 
          key="community"
        >
          <div className="p-4">
            {communityPosts.length === 0 ? (
              <Empty description="커뮤니티 게시물이 없습니다" />
            ) : (
              <div className="space-y-3">
                {communityPosts.slice(0, 3).map((post) => (
                  <div 
                    key={post.metadata.id}
                    onClick={() => navigate(`/community/${post.metadata.id}`)}
                    className="group p-4 border border-gray-100 hover:border-dashboard-primary rounded-xl cursor-pointer transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                          {post.content.title}
                        </h4>
                        {post.metadata.commentCount > 0 && (
                          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                            댓글 {post.metadata.commentCount}
                          </span>
                        )}
                      </div>
                      
                      <button className="text-dashboard-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        자세히 보기
                      </button>
                    </div>
                    
                    <div className="flex space-x-3 text-sm">
                      <span className="bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded">
                        {post.metadata.category}
                      </span>
                      <span className="text-dashboard-text-secondary">
                        {new Date(post.metadata.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-6">
              <button 
                onClick={() => navigate('/community')}
                className="text-dashboard-primary hover:text-dashboard-secondary inline-flex items-center space-x-1 transition-colors"
              >
                <span>전체 커뮤니티 보기</span>
                <RightOutlined />
              </button>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BoardTabs; 