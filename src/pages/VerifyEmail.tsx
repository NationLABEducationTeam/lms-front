import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography } from '@mui/material';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      console.log('이메일 인증 성공');
      navigate('/login');
    } catch (err: any) {
      console.error('이메일 인증 오류:', err);
      setError('인증 코드가 올바르지 않습니다.');
    }
  };

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: email });
      console.log('인증 코드 재전송 성공');
    } catch (err: any) {
      console.error('인증 코드 재전송 오류:', err);
      setError('인증 코드 재전송에 실패했습니다.');
    }
  };

  if (!email) {
    navigate('/register');
    return null;
  }

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
          이메일 인증
        </Typography>
        <Typography sx={{ mt: 2, mb: 2 }}>
          {email}로 전송된 인증 코드를 입력해주세요.
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
            id="code"
            label="인증 코드"
            name="code"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            인증하기
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={handleResendCode}
          >
            인증 코드 재전송
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default VerifyEmail; 