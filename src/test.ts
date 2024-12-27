import { signUp, signIn, confirm } from "./config/auth";

// 회원가입 테스트
(async function() {
    try {
        // 1. 회원가입
        // const signUpResult = await signUp({
        //     Username: 'test.student3@example.com',
        //     Password: 'Test1234!',
        //     Email: 'test.student3@example.com',
        //     Role: 'STUDENT'
        // });
        // console.log('회원가입 결과:', signUpResult);

        // 2. 이메일로 받은 인증 코드로 확인
        // const confirmResult = await confirm({
        //     Username: 'test.student3@example.com',
        //     ConfirmationCode: '123456'  // 이메일로 받은 코드를 입력
        // });
        // console.log('인증 결과:', confirmResult);

        // 3. 로그인
        const idToken = await signIn({
            Username: 'test.student3@example.com',
            Password: 'Test1234!'
        });
        console.log('로그인 성공! ID Token:', idToken);
    } catch (error) {
        console.error('에러:', error);
    }
})(); 