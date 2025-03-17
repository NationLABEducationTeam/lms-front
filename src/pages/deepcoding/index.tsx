import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/ui/button';
import { Code, Brain, Zap, Trophy, CheckCircle, ArrowRight, Users, Laptop, BarChart } from 'lucide-react';
import DeepCodingHeader from '@/components/deepcoding/DeepCodingHeader';
import { useNavigate } from 'react-router-dom';

const DeepCodingPage: FC = () => {
  const features = [
    {
      icon: <Code className="w-8 h-8 text-indigo-600" />,
      title: "다양한 언어 지원",
      description: "Python, Java, JavaScript, C++, Go 등 다양한 프로그래밍 언어를 지원합니다."
    },
    {
      icon: <Brain className="w-8 h-8 text-indigo-600" />,
      title: "AI 기반 분석",
      description: "AI가 코드를 분석하여 개선점과 최적화 방안을 제안합니다."
    },
    {
      icon: <Zap className="w-8 h-8 text-indigo-600" />,
      title: "실시간 피드백",
      description: "코드 작성 중 실시간으로 피드백을 받아 더 나은 코드를 작성할 수 있습니다."
    }
  ];

  const benefits = [
    "100+ 알고리즘 문제 제공",
    "실제 기업 코딩 테스트 유형 제공",
    "개인 맞춤형 학습 경로",
    "코드 리뷰 및 피드백",
    "성장 통계 및 분석",
    "취업 연계 서비스"
  ];

  const redirectToDeepCoding = () => {
    window.open('https://deepcoding.nationlab.io', '_blank');
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <DeepCodingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight"
            >
              코딩 테스트<br />
              <span className="text-indigo-600">더 스마트하게 준비하세요</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 mb-12 leading-relaxed"
            >
              Nation's LAB의 딥코딩테스트로<br />
              코딩 테스트 합격률을 높이세요
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button 
                size="lg" 
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-6 text-lg rounded-xl flex items-center justify-center gap-2 group"
                onClick={redirectToDeepCoding}
              >
                무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-gray-100 border border-indigo-200 px-8 py-6 text-lg rounded-xl flex items-center justify-center gap-2 group"
                onClick={() => navigate('/deepcoding/problems')}
              >
                문제 풀어보기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              딥코딩테스트만의 특별한 기능
            </h2>
            <p className="text-lg text-gray-600">
              AI 기반 코딩 테스트 플랫폼으로 더 효율적인 학습을 경험하세요
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              딥코딩테스트의 장점
            </h2>
            <p className="text-lg text-gray-600">
              코딩 테스트 준비부터 취업까지 한번에 해결하세요
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              합리적인 요금제
            </h2>
            <p className="text-lg text-gray-600">
              필요에 맞는 요금제를 선택하세요
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 무료 요금제 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">무료 체험</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">₩0</span>
                  <span className="text-gray-500 ml-2">/ 월</span>
                </div>
                <p className="text-gray-600 mb-6">코딩 테스트를 처음 시작하는 분들을 위한 요금제</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">기본 문제 10개</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">기본 AI 피드백</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">커뮤니티 접근</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200"
                  onClick={redirectToDeepCoding}
                >
                  무료로 시작하기
                </Button>
              </div>
            </motion.div>

            {/* 프리미엄 요금제 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-500 rounded-2xl shadow-lg overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                인기
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">프리미엄</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">₩29,900</span>
                  <span className="text-gray-500 ml-2">/ 월</span>
                </div>
                <p className="text-gray-600 mb-6">취업을 준비하는 개발자를 위한 요금제</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">모든 문제 접근 가능</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">고급 AI 코드 분석</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">맞춤형 학습 경로</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">주간 코드 리뷰</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">취업 연계 서비스</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={redirectToDeepCoding}
                >
                  시작하기
                </Button>
              </div>
            </motion.div>

            {/* 기업 요금제 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">기업용</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">문의</span>
                </div>
                <p className="text-gray-600 mb-6">기업 맞춤형 코딩 테스트 플랫폼</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">맞춤형 문제 출제</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">지원자 분석 대시보드</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">기술 면접 지원</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">API 연동</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">전담 매니저 지원</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gray-900 text-white hover:bg-gray-800"
                  onClick={() => window.location.href = 'mailto:contact@nationlab.io'}
                >
                  문의하기
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600">
              딥코딩테스트에 대한 궁금증을 해결해 드립니다
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                question: "딥코딩테스트는 어떤 서비스인가요?",
                answer: "딥코딩테스트는 AI 기반의 코딩 테스트 플랫폼으로, 개발자들이 코딩 테스트를 효과적으로 준비할 수 있도록 다양한 문제와 실시간 피드백을 제공합니다."
              },
              {
                question: "어떤 프로그래밍 언어를 지원하나요?",
                answer: "Python, Java, JavaScript, C++, Go 등 주요 프로그래밍 언어를 모두 지원합니다."
              },
              {
                question: "무료 체험은 어떻게 사용하나요?",
                answer: "회원가입 후 바로 무료 체험을 시작할 수 있으며, 10개의 기본 문제와 AI 피드백을 제공받을 수 있습니다."
              },
              {
                question: "기업용 서비스는 어떻게 신청하나요?",
                answer: "기업용 서비스는 이메일(contact@nationlab.io)로 문의해 주시면 전담 매니저가 맞춤형 솔루션을 제안해 드립니다."
              },
              {
                question: "취업 연계 서비스는 어떻게 이용하나요?",
                answer: "프리미엄 요금제 사용자는 자동으로 취업 연계 서비스에 등록되며, 우수한 성과를 보인 사용자에게 채용 기회를 제공합니다."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            지금 바로 딥코딩테스트를 시작하세요
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            코딩 테스트 합격률을 높이고 개발 역량을 향상시키는 가장 스마트한 방법
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-6 text-lg rounded-xl"
              onClick={redirectToDeepCoding}
            >
              무료로 시작하기
            </Button>
            <Button 
              size="lg" 
              className="bg-indigo-800 text-white hover:bg-indigo-900 border border-indigo-500 px-8 py-6 text-lg rounded-xl"
              onClick={() => navigate('/deepcoding/problems')}
            >
              문제 풀어보기
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-1">
                <img src="/long-logo.png" alt="Nation's LAB DeepCoding" className="h-8" />
                <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  DeepCoding
                </span>
              </div>
              <p className="mt-2 text-sm">
                © {new Date().getFullYear()} Nation's LAB. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">서비스</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="hover:text-white transition-colors">서비스 소개</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">요금제</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">자주 묻는 질문</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">회사</h4>
                <ul className="space-y-2">
                  <li><a href="/" className="hover:text-white transition-colors">Nation's LAB</a></li>
                  <li><a href="/corporate" className="hover:text-white transition-colors">기업교육</a></li>
                  <li><a href="mailto:contact@nationlab.io" className="hover:text-white transition-colors">문의하기</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeepCodingPage; 