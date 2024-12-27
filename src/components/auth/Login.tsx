import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Link } from '@mui/material';
import { signIn } from 'aws-amplify/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await signIn({ username: email, password });
      console.log('로그인 성공:', user);
      
      // 역할 선택 페이지로 이동
      navigate('/role-select');
    } catch (err: any) {
      console.error('로그인 오류:', err);
      if (err.code === 'UserNotConfirmedException') {
        setError('이메일 인증이 필요합니다.');
        navigate('/verify-email', { state: { email } });
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          로그인
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="이메일"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="비밀번호"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            로그인
          </Button>
          <Link href="/register" variant="body2">
            {"계정이 없으신가요? 회원가입"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 