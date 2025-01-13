import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCategories } from '@/store/features/courses/coursesSlice';
import { Breadcrumb, Card, List, Spin } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';

export const CategoryBrowser: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, currentPath, loading, error } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    dispatch(fetchCategories(''));
  }, [dispatch]);

  const handleFolderClick = (path: string) => {
    dispatch(fetchCategories(path));
  };

  const pathSegments = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-4">
      {/* 경로 표시 */}
      <Breadcrumb>
        <Breadcrumb.Item onClick={() => dispatch(fetchCategories(''))}>
          홈
        </Breadcrumb.Item>
        {pathSegments.map((segment, index) => (
          <Breadcrumb.Item 
            key={segment}
            onClick={() => handleFolderClick(pathSegments.slice(0, index + 1).join('/'))}
          >
            {segment}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      {/* 로딩/에러 처리 */}
      {loading ? (
        <div className="flex justify-center p-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8">
          {error}
        </div>
      ) : (
        /* 폴더/파일 목록 */
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={categories}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => item.type === 'directory' && handleFolderClick(item.path)}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  {item.type === 'directory' ? (
                    <FolderOutlined className="text-blue-500 text-xl" />
                  ) : (
                    <FileOutlined className="text-gray-500 text-xl" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}; 