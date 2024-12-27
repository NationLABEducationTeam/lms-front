import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/alert";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (!email) {
    navigate('/auth');
    return null;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const username = email.split('@')[0];
      await confirmSignUp({
        username,
        confirmationCode: code
      });
      navigate('/auth');
    } catch (err: any) {
      console.error('인증 오류:', err);
      if (err.name === 'ExpiredCodeException') {
        setError('인증 코드가 만료되었습니다. 새로운 코드를 요청해주세요.');
      } else if (err.name === 'CodeMismatchException') {
        setError('잘못된 인증 코드입니다. 다시 확인해주세요.');
      } else {
        setError('인증 중 오류가 발생했습니다.');
      }
    }
  };

  const handleResendCode = async () => {
    try {
      const username = email.split('@')[0];
      await resendSignUpCode({ username });
      setError('');
      setResendDisabled(true);
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('코드 재전송 오류:', err);
      setError('인증 코드 재전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[400px] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">이메일 인증</CardTitle>
          <CardDescription className="text-center">
            {email}로 전송된 인증 코드를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify}>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="code">인증 코드</Label>
                <Input
                  id="code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <Button type="submit">
                인증하기
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResendCode}
                disabled={resendDisabled}
              >
                인증 코드 재전송 {countdown > 0 && `(${countdown}초)`}
              </Button>
            </div>
          </form>
        </CardContent>
        {error && (
          <CardFooter>
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail; 