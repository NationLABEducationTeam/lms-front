import { FC, ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  const [showFooter, setShowFooter] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/verify-email';

  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom = 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      setShowFooter(scrolledToBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAuthPage && <Header />}
      <main className={!isAuthPage ? "pt-16 flex-grow" : "flex-grow"}>
        {children}
      </main>
      {!isAuthPage && (
        <div className={`transition-opacity duration-300 ${showFooter ? 'opacity-100' : 'opacity-0'}`}>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default RootLayout; 