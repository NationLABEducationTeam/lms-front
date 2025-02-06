import { FC } from 'react';
import { Helmet } from 'react-helmet-async';

const Header: FC = () => {
  return (
    <Helmet>
      <title>Nations LAB LMS - 최고의 IT 교육 플랫폼</title>
      <meta name="description" content="Nations LAB LMS는 클라우드, AI/ML, 웹 개발 등 최신 IT 기술 교육을 제공하는 온라인 학습 플랫폼입니다." />
      <meta name="keywords" content="IT교육, 클라우드, AI, ML, 웹개발, DevOps, 코딩테스트" />
      <meta property="og:title" content="Nations LAB LMS" />
      <meta property="og:description" content="최신 IT 기술을 배우는 가장 효과적인 방법" />
      <meta property="og:image" content="/og-image.png" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href="https://lms.nationslab.com" />
    </Helmet>
  );
};

export default Header; 