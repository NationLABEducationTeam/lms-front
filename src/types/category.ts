export type MainCategory = 'AI' | 'CLOUD' | 'SECURITY' | 'DEVELOPMENT' | 'BUSINESS';

export interface SubCategory {
  id: string;
  label: string;
  description: string;
}

export interface CategoryConfig {
  id: MainCategory;
  label: string;
  icon: string;
  description: string;
  subcategories: SubCategory[];
}

export const CATEGORY_CONFIG: Record<MainCategory, CategoryConfig> = {
  AI: {
    id: 'AI',
    label: '인공지능',
    icon: 'Brain',
    description: '머신러닝, 딥러닝, 자연어 처리 등 AI 관련 과정',
    subcategories: [
      {
        id: 'machine-learning',
        label: '머신러닝',
        description: '기계학습의 기초부터 고급 알고리즘까지'
      },
      {
        id: 'deep-learning',
        label: '딥러닝',
        description: '신경망 이론과 실전 프로젝트'
      },
      {
        id: 'nlp',
        label: '자연어 처리',
        description: '텍스트 분석과 언어 모델링'
      }
    ]
  },
  CLOUD: {
    id: 'CLOUD',
    label: '클라우드',
    icon: 'Cloud',
    description: 'AWS, Azure, GCP 등 클라우드 플랫폼 학습',
    subcategories: [
      {
        id: 'aws',
        label: 'AWS',
        description: 'Amazon Web Services 기초와 응용'
      },
      {
        id: 'azure',
        label: 'Azure',
        description: 'Microsoft Azure 클라우드 서비스'
      },
      {
        id: 'gcp',
        label: 'GCP',
        description: 'Google Cloud Platform 실무 활용'
      }
    ]
  },
  SECURITY: {
    id: 'SECURITY',
    label: '보안',
    icon: 'Award',
    description: '정보보안, 네트워크 보안, 보안 인증',
    subcategories: [
      {
        id: 'network-security',
        label: '네트워크 보안',
        description: '네트워크 보안 기초와 실무'
      },
      {
        id: 'ethical-hacking',
        label: '모의해킹',
        description: '화이트해커 양성 과정'
      },
      {
        id: 'security-cert',
        label: '보안 자격증',
        description: '정보보안 자격증 준비'
      }
    ]
  },
  DEVELOPMENT: {
    id: 'DEVELOPMENT',
    label: '개발',
    icon: 'Code',
    description: '웹, 모바일, 백엔드 등 개발 실무 과정',
    subcategories: [
      {
        id: 'web',
        label: '웹 개발',
        description: '프론트엔드와 백엔드 개발'
      },
      {
        id: 'mobile',
        label: '모바일 개발',
        description: 'iOS와 Android 앱 개발'
      },
      {
        id: 'devops',
        label: 'DevOps',
        description: '개발과 운영의 통합 관리'
      }
    ]
  },
  BUSINESS: {
    id: 'BUSINESS',
    label: '비즈니스',
    icon: 'Briefcase',
    description: '기획, 마케팅, PM 등 비즈니스 실무',
    subcategories: [
      {
        id: 'planning',
        label: '기획',
        description: '서비스 기획과 프로젝트 관리'
      },
      {
        id: 'marketing',
        label: '마케팅',
        description: '디지털 마케팅 전략과 실행'
      },
      {
        id: 'pm',
        label: '프로젝트 관리',
        description: '프로젝트 매니저 실무 과정'
      }
    ]
  }
}; 