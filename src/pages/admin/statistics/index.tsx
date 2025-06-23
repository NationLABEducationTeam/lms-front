import { FC, useState, useEffect } from 'react';
import { Card } from '@/components/common/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminStatistics: FC = () => {
  // 나중에 API에서 받아올 데이터에 대한 State (현재는 빈 배열)
  const [monthlyData, setMonthlyData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  
  // useEffect(() => {
  //   // 나중에 이곳에서 API를 호출하여 데이터를 가져옵니다.
  //   // 예:
  //   // const fetchData = async () => {
  //   //   const stats = await getAdminStatistics();
  //   //   setMonthlyData(stats.monthly);
  //   //   setCourseData(stats.byCourse);
  //   //   setCompletionData(stats.completion);
  //   // };
  //   // fetchData();
  // }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">통계</h1>
          <p className="text-gray-600 mt-1">수강생 및 강의 통계를 확인합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">월별 수강생 추이</h2>
            <div className="h-80 flex items-center justify-center text-gray-500">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>데이터가 없습니다.</p>
              )}
            </div>
          </Card>

          <Card className="bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">강의별 수강생 수</h2>
            <div className="h-80 flex items-center justify-center text-gray-500">
              {courseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="students" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>데이터가 없습니다.</p>
              )}
            </div>
          </Card>

          <Card className="bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">수료 현황</h2>
            <div className="h-80 flex items-center justify-center text-gray-500">
              {completionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {completionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>데이터가 없습니다.</p>
              )}
            </div>
          </Card>

          <Card className="bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">통계 요약</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">총 수강생 수</span>
                <span className="text-lg font-semibold text-gray-900">0명</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">이번 달 신규 수강생</span>
                <span className="text-lg font-semibold text-gray-900">0명</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">수료율</span>
                <span className="text-lg font-semibold text-gray-900">0%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">평균 수강 기간</span>
                <span className="text-lg font-semibold text-gray-900">-</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics; 