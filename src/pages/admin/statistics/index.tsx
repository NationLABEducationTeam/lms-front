import { FC } from 'react';
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

const data = [
  { name: '1월', value: 120 },
  { name: '2월', value: 150 },
  { name: '3월', value: 180 },
  { name: '4월', value: 220 },
  { name: '5월', value: 280 },
  { name: '6월', value: 350 },
];

const courseData = [
  { name: 'AWS', students: 150 },
  { name: 'Azure', students: 120 },
  { name: 'GCP', students: 90 },
  { name: 'DevOps', students: 180 },
  { name: 'Kubernetes', students: 130 },
];

const completionData = [
  { name: '수료', value: 75 },
  { name: '진행중', value: 20 },
  { name: '중도포기', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const AdminStatistics: FC = () => {
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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">강의별 수강생 수</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="students" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">수료 현황</h2>
            <div className="h-80">
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
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">통계 요약</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">총 수강생 수</span>
                <span className="text-lg font-semibold text-gray-900">670명</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">이번 달 신규 수강생</span>
                <span className="text-lg font-semibold text-gray-900">70명</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">수료율</span>
                <span className="text-lg font-semibold text-gray-900">75%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">평균 수강 기간</span>
                <span className="text-lg font-semibold text-gray-900">3.5개월</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics; 