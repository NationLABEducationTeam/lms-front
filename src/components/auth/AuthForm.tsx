import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import { UserRole } from '../../config/cognito';
import { AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
      const signInInput = {
        username,
        password,
        options: {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
          userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID
        }
      };
      
      const { isSignedIn, nextStep } = await signIn(signInInput);
      
      if (isSignedIn) {
        const userAttributes = await fetchUserAttributes();
        const userRole = userAttributes['custom:role'] as UserRole;
        localStorage.setItem('userRole', userRole);

        switch (userRole) {
          case UserRole.STUDENT:
            navigate('/');
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

  const handleTabChange = (value: string) => {
    setIsAnimating(true);
    setActiveTab(value);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="flex-1 bg-blue-50 hidden lg:flex lg:items-center lg:justify-center p-12">
        <div className="text-center">
          <img 
            src="/sideillustration.png" 
            alt="Auth illustration" 
            className="max-w-[70%] mx-auto mb-8 h-auto"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Let's Nation's LAB!</h2>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-[#1a1f37]">
        <div className="max-w-[420px] mx-auto w-full">
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-center mb-6">
              <img src="/nationlmslogo.png" alt="NationsLAB" className="h-10 sm:h-12 w-auto" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Nation's LAB</h1>
            <p className="text-gray-300 text-sm sm:text-base">
              (주)에이아네이션의 혁신적인 교육 플랫폼
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
              <AlertTitle>성공</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-full">
              <div className="relative mb-8">
                <div className="relative z-10 grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-lg">
                  <button 
                    onClick={() => handleTabChange("login")}
                    className={[
                      "relative z-20 rounded-md py-2.5 text-gray-600 transition-colors duration-200",
                      activeTab === "login" ? "text-gray-900" : ""
                    ].join(" ")}
                  >
                    로그인
                  </button>
                  <button 
                    onClick={() => handleTabChange("register")}
                    className={[
                      "relative z-20 rounded-md py-2.5 text-gray-600 transition-colors duration-200",
                      activeTab === "register" ? "text-gray-900" : ""
                    ].join(" ")}
                  >
                    회원가입
                  </button>
                  <div 
                    className={[
                      "absolute left-0 top-0 h-full w-1/2 rounded-md bg-white shadow-sm transition-transform duration-300 ease-in-out",
                      activeTab === "register" ? "translate-x-full" : "",
                      isAnimating ? "transition-transform" : ""
                    ].join(" ")}
                  />
                </div>
              </div>

              <div className="relative h-[400px]">
                <div 
                  className={[
                    "absolute inset-0 transition-all duration-300 ease-in-out",
                    activeTab === "login" 
                      ? "translate-x-0 opacity-100" 
                      : "translate-x-8 opacity-0 pointer-events-none",
                    isAnimating ? "transition-all" : ""
                  ].join(" ")}
                >
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">이메일</Label>
                        <Input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          value={email}
                          onChange={handleInputChange}
                          required
                          className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">비밀번호</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={handleInputChange}
                          required
                          className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                        비밀번호 찾기
                      </a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                    >
                      로그인
                    </Button>
                  </form>
                </div>

                <div 
                  className={[
                    "absolute inset-0 transition-all duration-300 ease-in-out",
                    activeTab === "register" 
                      ? "translate-x-0 opacity-100" 
                      : "-translate-x-8 opacity-0 pointer-events-none",
                    isAnimating ? "transition-all" : ""
                  ].join(" ")}
                >
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">이메일</Label>
                        <Input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          value={email}
                          onChange={handleInputChange}
                          required
                          className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">이름</Label>
                        <Input
                          id="name"
                          placeholder="홍길동"
                          type="text"
                          value={name}
                          onChange={handleInputChange}
                          required
                          className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">비밀번호</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={handleInputChange}
                          required
                          className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700">비밀번호 확인</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700">역할</Label>
                        <Select onValueChange={handleRoleChange} defaultValue={role}>
                          <SelectTrigger 
                            id="role"
                            className="h-11 rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <SelectValue placeholder="역할을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem 
                              value={UserRole.STUDENT}
                              className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer py-2.5"
                            >
                              수강생
                            </SelectItem>
                            <SelectItem 
                              value={UserRole.INSTRUCTOR}
                              className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer py-2.5"
                            >
                              강사
                            </SelectItem>
                            <SelectItem 
                              value={UserRole.ADMIN}
                              className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer py-2.5"
                            >
                              관리자
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                    >
                      회원가입
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;