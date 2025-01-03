import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../common/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../common/ui/alert';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { AlertCircle } from 'lucide-react';

interface LocationState {
  email: string;
}

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = (location.state as LocationState) || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const username = email.split('@')[0];
      await confirmSignUp({
        username,
        confirmationCode: code
      });
      navigate('/', { state: { verificationSuccess: true } });
    } catch (error) {
      console.error('Verification error:', error);
      setError(error instanceof Error ? error.message : '인증 코드 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResending(true);

    try {
      const username = email.split('@')[0];
      await resendSignUpCode({
        username
      });
    } catch (error) {
      console.error('Resend code error:', error);
      setError(error instanceof Error ? error.message : '인증 코드 재전송 중 오류가 발생했습니다.');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <Card>
              <CardHeader>
                <CardTitle>오류</CardTitle>
                <CardDescription>이메일 정보를 찾을 수 없습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/register')}>회원가입으로 돌아가기</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card>
            <CardHeader>
              <CardTitle>이메일 인증</CardTitle>
              <CardDescription>{email}로 전송된 인증 코드를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">인증 코드</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>오류</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col space-y-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? '인증 중...' : '인증하기'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={resending}
                  >
                    {resending ? '재전송 중...' : '인증 코드 재전송'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 