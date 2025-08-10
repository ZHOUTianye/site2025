import React, { useState, useEffect, useMemo } from 'react';
import './Welcome.css';

const Welcome = () => {
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  
  // 多语言欢迎词 - 使用useMemo避免每次渲染重新创建
  const welcomeTexts = useMemo(() => [
    '欢迎！',
    '歡迎！',
    'Welcome!',
    '¡Bienvenido!',
    'ようこそ！',
    '환영합니다!',
    'स्वागत है!',
    'Bienvenue!',
    'Willkommen!',
    'Добро пожаловать!'
  ], []);

  useEffect(() => {
    const currentText = welcomeTexts[currentLanguage];
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        // 正在输入
        setDisplayText(prev => prev + currentText[charIndex]);
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        // 正在删除
        setDisplayText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        // 输入完毕，准备删除
        setTimeout(() => setIsDeleting(true), 1000); // 停留1秒
      } else if (isDeleting && charIndex === 0) {
        // 删除完毕，切换语言
        setIsDeleting(false);
        setCurrentLanguage(prev => (prev + 1) % welcomeTexts.length);
      }
    }, 200); // 0.2秒间隔

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentLanguage, welcomeTexts]);

  return (
    <div className="welcome-container">
      {/* 主要内容 */}
      <div className="main-content">
        <div className="welcome-text">
          <h1 className="welcome-title">
            {displayText}
            <span className="cursor">|</span>
          </h1>
          <h2 className="subtitle">这里是周天野的主页。</h2>
        </div>

        {/* 导航按钮 */}
        <div className="navigation-buttons">
          <button className="nav-btn">关于我</button>
          <button className="nav-btn">过往和当下</button>
          <button className="nav-btn">服务和产品</button>
          <button className="nav-btn">快捷链接</button>
        </div>
      </div>
      <div className="welcome-footer">
        <p>网站升级中，所有链接均无法跳转。站长正在努力完善，预计在2025年年底完成，给您带来的不便敬请谅解！</p>
      </div>
    </div>
  );
};

export default Welcome; 