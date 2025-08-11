import React, { useState, useRef, useEffect } from 'react';
import './NavigationMenu.css';

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);

  const openMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsClosing(false);
    setIsOpen(true);
  };

  const startClose = () => {
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 320);
  };

  const toggleMenu = () => {
    if (!isOpen) {
      openMenu();
    } else {
      startClose();
    }
  };

  const closeMenu = () => {
    if (isOpen && !isClosing) startClose();
  };

  // 控制 body 滚动（菜单打开或关闭动画期间禁用滚动）
  useEffect(() => {
    const shouldLock = isOpen || isClosing;
    if (shouldLock) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isOpen, isClosing]);

  // 清理关闭定时器
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const isBackdropVisible = isOpen || isClosing;

  return (
    <>
      {/* 全屏遮罩作为兄弟节点，层级低于菜单，不遮挡菜单 */}
      {isBackdropVisible && (
        <div
          className={`menu-backdrop ${isClosing ? 'closing' : 'active'}`}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <div className="navigation-menu">
        {/* 合并的汉堡菜单按钮和快捷入口菜单 */}
        <div className={`hamburger-menu ${isOpen ? 'active' : ''} ${isClosing ? 'closing' : ''}`}>
          {/* 汉堡菜单线条 */}
          <div
            className="hamburger-lines"
            onClick={toggleMenu}
            role="button"
            aria-label={isOpen ? '关闭导航菜单' : '打开导航菜单'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
              }
            }}
          >
            <div className="hamburger-line top-line"></div>
            <div className="hamburger-line middle-line"></div>
            <div className="hamburger-line bottom-line"></div>
          </div>

          {/* 展开状态下显示的乘号关闭按钮（与汉堡线条同位置、同尺寸） */}
          {isOpen && (
            <button
              className="close-icon"
              onClick={closeMenu}
              aria-label="关闭导航菜单"
            />
          )}
          
          {/* 快捷入口菜单内容 */}
          <div className="quick-access-content">
            <div className="menu-header">
              <h3>快捷入口</h3>
            </div>
            
            <div className="main-navigation">
              <a href="#about" className="nav-link">关于我</a>
              <a href="#past" className="nav-link">过往和当下</a>
              <a href="#services" className="nav-link">服务和产品</a>
              <a href="#links" className="nav-link">快捷链接</a>
            </div>
            
            <div className="language-section">
              <span className="language-option active">简体中文</span>
              <span className="language-option">English</span>
              <span className="language-option">Español</span>
            </div>
            
            <div className="action-section">
              <button className="action-btn register-btn">注册</button>
              <button className="action-btn login-btn">登录</button>
            </div>
          </div>
          
          {/* 点击区域覆盖整个元素（仅在未展开时使用） */}
          {!isOpen && (
            <button 
              className="menu-toggle-button"
              onClick={toggleMenu}
              aria-label="打开导航菜单"
            ></button>
          )}
        </div>
      </div>
    </>
  );
};

export default NavigationMenu; 