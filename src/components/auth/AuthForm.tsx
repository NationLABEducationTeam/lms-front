import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import { UserRole } from '../../config/cognito';
import { AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/common/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";

import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/ui/tabs";

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { verificationSuccess?: boolean };
    if (state?.verificationSuccess) {
      setSuccess('이메일 인증이 완료되었습니다. 로그인해주세요.');
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    switch (id) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'name':
        setName(value);
        break;
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const username = email.split('@')[0];
      console.log('Attempting login with:', { 
        username, 
        email,
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
        region: import.meta.env.VITE_AWS_REGION
      });

      const signInInput = {
        username,
        password,
        options: {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
          userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID
        }
      };
      
      const { isSignedIn, nextStep } = await signIn(signInInput);
      console.log('Sign in result:', { isSignedIn, nextStep });
      
      if (isSignedIn) {
        const user = await getCurrentUser();
        console.log('Current user:', user);
        
        const userAttributes = await fetchUserAttributes();
        console.log('User attributes:', userAttributes);
        
        const userRole = userAttributes['custom:role'] as UserRole;
        console.log('User role:', userRole);
        
        localStorage.setItem('userRole', userRole);

        switch (userRole) {
          case UserRole.STUDENT:
            navigate('/student');
            break;
          case UserRole.INSTRUCTOR:
            navigate('/instructor');
            break;
          case UserRole.ADMIN:
            navigate('/admin');
            break;
          default:
            setError('사용자 권한을 확인할 수 없습니다.');
        }
      }
    } catch (err: any) {
      console.error('로그인 오류:', err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const username = email.split('@')[0];
      console.log('Attempting registration with:', { 
        username, 
        email,
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
        region: import.meta.env.VITE_AWS_REGION
      });
      
      const signUpInput = {
        username,
        password,
        options: {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
          userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
          userAttributes: {
            email,
            'custom:role': role,
            given_name: name,
            name: username
          }
        }
      };
      
      const { userId, isSignUpComplete } = await signUp(signUpInput);
      console.log('Sign up result:', { userId, isSignUpComplete });
      
      await addUserToGroup(username, role);
      
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      console.error('회원가입 오류:', err);
      handleAuthError(err);
    }
  };

  const handleAuthError = (err: any) => {
    switch (err.name) {
      case 'UserNotConfirmedException':
        setError('이메일 인증이 필요합니다.');
        navigate('/verify-email', { state: { email } });
        break;
      case 'NotAuthorizedException':
        setError('이메일 또는 비밀번호가 바르지 않습니다.');
        break;
      case 'UserNotFoundException':
        setError('등록되지 않은 이메일입니다.');
        break;
      case 'UsernameExistsException':
        setError('이미 등록된 이메일입니다.');
        break;
      case 'InvalidPasswordException':
        setError('비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
        break;
      default:
        setError('인증 중 오류가 발생했습니다.');
    }
  };

  const addUserToGroup = async (username: string, groupName: string) => {
    if (!import.meta.env.VITE_AWS_REGION || 
        !import.meta.env.VITE_AWS_ACCESS_KEY_ID || 
        !import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || 
        !import.meta.env.VITE_COGNITO_USER_POOL_ID) {
      console.error('AWS 설정이 누락되었습니다.');
      return;
    }

    try {
      const cognitoClient = new CognitoIdentityProviderClient({
        region: import.meta.env.VITE_AWS_REGION,
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
        }
      });
      
      const addToGroupCommand = new AdminAddUserToGroupCommand({
        UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        Username: username,
        GroupName: groupName
      });
      
      await cognitoClient.send(addToGroupCommand);
      console.log('사용자를 그룹에 추가했습니다:', { username, groupName });
    } catch (groupErr) {
      console.error('그룹 할당 오류:', groupErr);
    }
  };

  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-[420px] mx-auto space-y-6">
        <div className="text-center space-y-2 px-4">
          <div className="flex items-center justify-center mb-6">
            <img src="/nationlmslogo.png" alt="NationsLAB LMS" className="h-10 sm:h-12 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-700">NationsLAB</h1>
          <p className="text-slate-500 text-sm sm:text-base">
            (주)에이아네이션의 혁신적인 교육 플랫폼
          </p>
        </div>
        <Card className="border-0 shadow-xl bg-white mx-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#65e892] via-[#3994d6] to-[#354abf] p-[3px] rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3994d6] via-[#354abf] to-[#3d289b] blur-xl opacity-50" />
          </div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-1">
            <CardHeader className="space-y-1 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-[#65e892] to-[#3994d6] bg-clip-text text-transparent">계정</CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                로그인하거나 새 계정을 만드세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 rounded-lg bg-slate-50/50 backdrop-blur-sm p-1">
                  <TabsTrigger value="login" className="rounded-md text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#65e892] data-[state=active]:to-[#3994d6] data-[state=active]:text-white">로그인</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-md text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#65e892] data-[state=active]:to-[#3994d6] data-[state=active]:text-white">회원가입</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm sm:text-base">이메일</Label>
                        <Input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          value={email}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base focus-visible:ring-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm sm:text-base">비밀번호</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base focus-visible:ring-slate-600"
                        />
                      </div>
                    </div>
                    <Button className="w-full h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-[#65e892] to-[#3994d6] hover:from-[#3994d6] hover:to-[#354abf] text-white shadow-lg transition-all duration-300 hover:shadow-xl" type="submit">
                      로그인
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm sm:text-base">이메일</Label>
                        <Input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          value={email}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base focus-visible:ring-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm sm:text-base">이름</Label>
                        <Input
                          id="name"
                          placeholder="홍길동"
                          type="text"
                          value={name}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base focus-visible:ring-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm sm:text-base">비밀번호</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base focus-visible:ring-[#3994d6]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm sm:text-base">비밀번호 확인</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="h-10 sm:h-11 text-sm sm:text-base focus-visible:ring-[#3994d6]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm sm:text-base">역할</Label>
                        <Select onValueChange={handleRoleChange} defaultValue={role}>
                          <SelectTrigger id="role" className="h-10 sm:h-11 text-sm sm:text-base focus:ring-[#3994d6]">
                            <SelectValue placeholder="역할을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.STUDENT} className="text-sm sm:text-base">수강생</SelectItem>
                            <SelectItem value={UserRole.INSTRUCTOR} className="text-sm sm:text-base">강사</SelectItem>
                            <SelectItem value={UserRole.ADMIN} className="text-sm sm:text-base">관리자</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-[#65e892] to-[#3994d6] hover:from-[#3994d6] hover:to-[#354abf] text-white shadow-lg transition-all duration-300 hover:shadow-xl" type="submit">
                      회원가입
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            {error && (
              <CardFooter className="px-4 sm:px-6">
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm sm:text-base">오류</AlertTitle>
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </CardFooter>
            )}
            {success && (
              <CardFooter className="px-4 sm:px-6">
                <Alert className="w-full bg-green-50 text-green-900 border-green-200">
                  <AlertTitle className="text-sm sm:text-base">성공</AlertTitle>
                  <AlertDescription className="text-sm">{success}</AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;