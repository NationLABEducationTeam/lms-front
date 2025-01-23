import { FC, useState } from 'react';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Switch } from '@/components/common/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/ui/tabs';

const AdminSystem: FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoEnrollment, setAutoEnrollment] = useState(false);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">시스템 관리</h1>
          <p className="text-gray-600 mt-1">시스템 설정 및 환경을 관리합니다.</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="text-gray-900 data-[state=active]:bg-gray-100">일반 설정</TabsTrigger>
            <TabsTrigger value="security" className="text-gray-900 data-[state=active]:bg-gray-100">보안</TabsTrigger>
            <TabsTrigger value="notifications" className="text-gray-900 data-[state=active]:bg-gray-100">알림</TabsTrigger>
            <TabsTrigger value="backup" className="text-gray-900 data-[state=active]:bg-gray-100">백업</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">시스템 상태</CardTitle>
                  <CardDescription className="text-gray-600">
                    시스템의 전반적인 상태를 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">유지보수 모드</p>
                      <p className="text-sm text-gray-600">활성화시 사용자 접근이 제한됩니다.</p>
                    </div>
                    <Switch
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">자동 수강신청</p>
                      <p className="text-sm text-gray-600">신규 사용자 자동 수강신청 허용</p>
                    </div>
                    <Switch
                      checked={autoEnrollment}
                      onCheckedChange={setAutoEnrollment}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">도메인 설정</CardTitle>
                  <CardDescription className="text-gray-600">
                    시스템 도메인 및 URL 설정을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-900">시스템 도메인</label>
                    <Input
                      placeholder="example.com"
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-900">API 엔드포인트</label>
                    <Input
                      placeholder="https://api.example.com"
                      className="bg-white border-gray-200"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">보안 설정</CardTitle>
                <CardDescription className="text-gray-600">
                  시스템의 보안 관련 설정을 관리합니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSystem;