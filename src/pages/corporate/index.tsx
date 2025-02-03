import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Users, Target, Award, CheckCircle, Building2, BarChart, Zap, ArrowRight } from 'lucide-react';
import CorporateHeader from '@/components/corporate/CorporateHeader';

const CorporatePage: FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    employees: '',
    budget: '',
    timeline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "맞춤형 커리큘럼",
      description: "기업의 현재 기술 스택과 목표에 맞는 맞춤형 교육과정을 설계합니다."
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "실무 프로젝트",
      description: "실제 업무에서 마주하는 문제를 해결하는 프로젝트 기반 학습을 진행합니다."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "현업 전문가",
      description: "각 분야 현업 전문가들의 실전 경험을 통한 노하우를 전수받습니다."
    }
  ];

  const benefits = [
    "체계적인 교육 관리 시스템",
    "학습 진도 및 성과 분석",
    "수료증 발급 및 이수 관리",
    "온/오프라인 교육 지원",
    "교육 만족도 조사",
    "교육비 환급 지원"
  ];

  const companies = [
    "/companies/samsung.png",
    "/companies/lg.png",
    "/companies/sk.png",
    "/companies/naver.png",
    "/companies/kakao.png",
    "/companies/line.png",
  ];

  return (
    <div className="min-h-screen bg-white">
      <CorporateHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight"
            >
              기업 맞춤형<br />
              <span className="text-blue-600">소프트웨어 개발자 교육</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 mb-12 leading-relaxed"
            >
              Nation's LAB과 함께<br />
              귀사의 개발자 역량을 한 단계 높여보세요
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button 
                size="lg" 
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-6 text-lg rounded-xl flex items-center justify-center gap-2 group"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                무료 상담 신청
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nation's LAB만의 차별화된 교육
            </h2>
            <p className="text-lg text-gray-600">
              10년간의 교육 노하우를 바탕으로 최고의 교육을 제공합니다
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
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
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
              기업교육 도입 시 얻을 수 있는 혜택
            </h2>
            <p className="text-lg text-gray-600">
              체계적인 교육 관리부터 성과 분석까지 원스톱으로 제공합니다
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
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                무료 상담 신청
              </h2>
              <p className="text-lg text-gray-600">
                기업에 맞는 최적의 교육 프로그램을 제안해드립니다
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    회사명 *
                  </label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="회사명을 입력해주세요"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-2">
                    교육 예상 인원 *
                  </label>
                  <Input
                    id="employees"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    placeholder="예) 10명"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    담당자명 *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="담당자 성함을 입력해주세요"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-0000-0000"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@company.com"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    교육 희망 시기
                  </label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="예) 2024년 4월"
                    className="bg-white"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용 *
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="원하시는 교육 내용이나 문의사항을 자세히 적어주세요"
                  className="h-32 bg-white"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 py-6 text-lg rounded-xl flex items-center justify-center gap-2 group"
              >
                무료 상담 신청하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                제출하신 정보는 상담 목적으로만 사용됩니다
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* 파트너사 섹션 */}
      <section id="cases" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              n개의 기업이 Nation's LAB과 함께합니다
            </h2>
            <p className="text-lg text-gray-600">
              다양한 산업 분야의 기업들이 Nation's LAB의 교육 프로그램을 신뢰하고 있습니다
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {companies.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center p-4"
              >
                <img src={logo} alt="Partner Company" className="h-12 opacity-60 hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporatePage; 