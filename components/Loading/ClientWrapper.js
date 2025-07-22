'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';
import './ClientWrapper.scss';

const LoadingContext = createContext({
  isLoadingComplete: false,
  shouldTriggerAnimation: false,
  triggerPageAnimation: () => {},
});

export const useLoadingContext = () => useContext(LoadingContext);

const ClientWrapper = ({ children }) => {
  const pathname = usePathname();
  const [showLoading, setShowLoading] = useState(false);
  const [isCheckingVisit, setIsCheckingVisit] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [shouldHideContent, setShouldHideContent] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [shouldTriggerAnimation, setShouldTriggerAnimation] = useState(false);
  const alreadyChecked = useRef(false); // ← 初回チェックフラグ

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setTimeout(() => {
        if (document.hidden) {
          try {
            sessionStorage.removeItem('currentSessionVisited');
          } catch (error) {
            console.warn('SessionStorage not available:', error);
          }
        }
      }, 30000);
    }
  };

  const handleBeforeUnload = () => {
    try {
      sessionStorage.removeItem('currentSessionVisited');
    } catch (error) {
      console.warn('SessionStorage not available:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);

    if (alreadyChecked.current) return;
    alreadyChecked.current = true;

    const checkVisitStatus = () => {
      try {
        if (pathname === '/') {
          const currentSessionVisited = sessionStorage.getItem('currentSessionVisited');
          if (!currentSessionVisited) {
            setShouldHideContent(true);
            setShowLoading(true);
            sessionStorage.setItem('currentSessionVisited', 'true');
          } else {
            setContentVisible(true);
            setIsLoadingComplete(true);
            setTimeout(() => setShouldTriggerAnimation(true), 100);
          }
        } else {
          setContentVisible(true);
          setIsLoadingComplete(true);
          setShouldTriggerAnimation(true);
        }
      } catch (error) {
        console.warn('SessionStorage not available:', error);
        setContentVisible(true);
        setIsLoadingComplete(true);
        setShouldTriggerAnimation(true);
      }

      setIsCheckingVisit(false);
    };

    checkVisitStatus();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShouldHideContent(false);
    setIsLoadingComplete(true);

    setTimeout(() => {
      setContentVisible(true);
      setTimeout(() => {
        setShouldTriggerAnimation(true);
      }, 1000);
    }, 150);
  };

  const triggerPageAnimation = () => {
    setShouldTriggerAnimation(true);
  };

  const contextValue = {
    isLoadingComplete,
    shouldTriggerAnimation,
    triggerPageAnimation,
  };

  if (!isClient) {
    const ssrContentHidden = pathname === '/';
    return (
      <LoadingContext.Provider value={contextValue}>
        <div className="client-wrapper">
          <div
            className={`client-wrapper__content ${
              ssrContentHidden
                ? 'client-wrapper__content--hidden'
                : 'client-wrapper__content--visible'
            }`}
            style={
              ssrContentHidden
                ? { opacity: 0, visibility: 'hidden' }
                : {}
            }
          >
            {children}
          </div>
        </div>
      </LoadingContext.Provider>
    );
  }

  if (isCheckingVisit && pathname === '/') {
    return (
      <LoadingContext.Provider value={contextValue}>
        <div className="client-wrapper">
          <div
            className="client-wrapper__content--hidden"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            {children}
          </div>
        </div>
      </LoadingContext.Provider>
    );
  }

  if (isCheckingVisit) {
    return (
      <LoadingContext.Provider value={contextValue}>
        <div className="client-wrapper">
          <div className="client-wrapper__content client-wrapper__content--visible">
            {children}
          </div>
        </div>
      </LoadingContext.Provider>
    );
  }

  return (
    <LoadingContext.Provider value={contextValue}>
      <div className="client-wrapper">
        {showLoading && pathname === '/' && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
        <div
          className={`client-wrapper__content ${
            contentVisible
              ? 'client-wrapper__content--visible'
              : 'client-wrapper__content--hidden'
          }`}
          style={
            (shouldHideContent || (showLoading && pathname === '/')) &&
            !contentVisible
              ? { opacity: 0, visibility: 'hidden' }
              : {}
          }
        >
          {children}
        </div>
      </div>
    </LoadingContext.Provider>
  );
};

export default ClientWrapper;
