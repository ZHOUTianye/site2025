import React, { useRef, useEffect, useCallback, useState } from 'react';
import './Conclusion.css';
import '../../styles/textAnimation.css';

function Conclusion({ onScrollProgress, onBoundaryScroll, previousPage, currentPage, onIndicatorProgress }) {
  const containerRef = useRef(null);
  const stickyContentRef = useRef(null);
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [textSplitPercent, setTextSplitPercent] = useState(100); // 从黑到白，初始黑色为100%（全黑背景，显示白字）
  const [scrollProgress, setScrollProgress] = useState(0); // 0-1，用于抽屉动画
  const [animationKey, setAnimationKey] = useState(0); // 用于强制重新渲染动画

  const getAnimationClass = () => {
    if (previousPage === null) {
      return 'slide-up';
    }
    return previousPage < currentPage ? 'slide-up' : 'slide-down';
  };
  const animationClass = getAnimationClass();

  // 监听页面切换，重置动画
  useEffect(() => {
    // 每次页面切换时，增加animationKey来强制重新渲染
    setAnimationKey(prev => prev + 1);
  }, [currentPage, previousPage]);

  // 页面进入时设置正确的初始状态
  useEffect(() => {
    // 从Gallery页面进入时，确保显示白色文字（黑色背景）
    if (previousPage === 6) { // Gallery是第6页（索引6）
      setTextSplitPercent(100); // 全黑背景，显示白字
    }
  }, [previousPage]);

  // 更新滚动进度与分割位置
  const updateProgress = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) {
      setIsPageVisible(false);
      // 不要在这里重置textSplitPercent，保持当前状态
      return;
    }
    if (!isPageVisible) setIsPageVisible(true);

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    if (onScrollProgress) {
      onScrollProgress(progress);
    }
    // 复制核心变量（用于未来独立控制 indicator dot），不改变现有逻辑
    if (onIndicatorProgress) {
      onIndicatorProgress(progress);
    }
    setScrollProgress(progress);

    // 参考Personality页面逻辑：计算背景分界线位置
    const viewportHeight = window.innerHeight;
    const whiteAreaBottom = viewportHeight * (1 - 2*progress); // Personality用的是whiteAreaBottom
    // console.log(whiteAreaBottom);
    const sticky = stickyContentRef.current;
    if (sticky) {
      const contentRect = sticky.getBoundingClientRect();
      const contentTop = contentRect.top;
      const contentBottom = contentRect.bottom;
      const contentHeight = contentRect.height;

      // 计算分界线与文字内容的关系 - 参考Personality页面逻辑
      if (whiteAreaBottom <= contentTop) {
        // 分界线在内容上方 - 内容全在白色背景中，显示黑字
        setTextSplitPercent(0); 
      } else if (whiteAreaBottom >= contentBottom) {
        // 分界线在内容下方 - 内容全在黑色背景中，显示白字
        setTextSplitPercent(100);
      } else {
        // 分界线穿过内容 - 计算分割比例
        const splitPercent = ((whiteAreaBottom - contentTop) / contentHeight) * 100;
        const finalPercent = Math.max(0, Math.min(100, splitPercent));
        setTextSplitPercent(finalPercent);
      }
    }
  }, [isPageVisible, onScrollProgress]);

  // 平滑滚动到指定位置（仅用于鼠标滚轮）
  const animationRef = useRef(null);
  const smoothScrollTo = useCallback((targetY) => {
    const container = containerRef.current;
    if (!container) return;

    const startY = container.scrollTop;
    const distance = targetY - startY;
    const duration = 400;
    let startTime = null;

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      container.scrollTop = startY + distance * eased;
      updateProgress();
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
  }, [updateProgress]);

  // 触控板边界检测（通过scroll事件）
  const handleTouchpadBoundary = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    container.dataset.atTop = isAtTop;
    container.dataset.atBottom = isAtBottom;
  }, []);

  // 快速设备检测（仅用于鼠标滚轮）
  const isMouseWheel = useCallback((event) => {
    const normalizedDeltaY = event.deltaMode === 1
      ? event.deltaY * 16
      : event.deltaMode === 2
        ? event.deltaY * window.innerHeight
        : event.deltaY;
    const absDeltaY = Math.abs(normalizedDeltaY);
    const absDeltaX = Math.abs(event.deltaX);
    return absDeltaX === 0 && (absDeltaY >= 100 || absDeltaY % 120 === 0 || event.deltaMode === 1);
  }, []);

  // 专门处理触控板：到边界时交给上层翻页
  const handleTouchpadWheel = useCallback((event) => {
    const container = containerRef.current;
    if (!container) return;
    const deltaY = event.deltaY;
    const isAtTop = container.dataset.atTop === 'true';
    const isAtBottom = container.dataset.atBottom === 'true';
    
    // 只处理向上滚动到顶部的情况，禁用向下滚动边界检测（因为这是最后一页）
    if (isAtTop && deltaY < 0) {
      event.preventDefault();
      if (onBoundaryScroll) onBoundaryScroll('up');
    }
    // 移除向下滚动的边界检测，防止跳转到其他页面
  }, [onBoundaryScroll]);

  // 专门处理鼠标滚轮：平滑滚动，到边界触发翻页
  const handleMouseWheel = useCallback((event) => {
    const container = containerRef.current;
    if (!container) return;
    event.preventDefault();
    const deltaY = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    // 只处理向上滚动到顶部的情况，禁用向下滚动边界检测（因为这是最后一页）
    if (isAtTop && deltaY < 0) {
      if (onBoundaryScroll) onBoundaryScroll('up');
      return;
    }
    // 移除向下滚动的边界检测
    
    const scrollAmount = deltaY * 1.8; 
    const target = Math.max(0, Math.min(scrollHeight - clientHeight, scrollTop + scrollAmount));
    smoothScrollTo(target);
  }, [onBoundaryScroll, smoothScrollTo]);

  // 统一的wheel事件分发
  const handleWheel = useCallback((event) => {
    if (isMouseWheel(event)) {
      handleMouseWheel(event);
    } else {
      handleTouchpadWheel(event);
    }
  }, [isMouseWheel, handleMouseWheel, handleTouchpadWheel]);
  

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => { updateProgress(); handleTouchpadBoundary(); };
    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });
    updateProgress();
    handleTouchpadBoundary();
    return () => container.removeEventListener('scroll', onScroll);
  }, [updateProgress, handleWheel, handleTouchpadBoundary]);

  return (
    <div className="conclusion-container" ref={containerRef}>
      <div className="conclusion-combined">
        {/* 背景渐变层 - 覆盖整个300vh */}
        <div className="conclusion-all-bg" />
        
        {/* Sticky内容区域 - 前200vh */}
        <div className="conclusion-sticky-area">
          <div className="conclusion-sticky" ref={stickyContentRef}>
            <div className="conclusion-text-split">
              {/* 白色文字层（用于黑背景） - 处于下半屏，逐步扩大到整屏白 */}
              <div 
                className="conclusion-layer layer-light"
                style={{
                  clipPath: `polygon(0 ${textSplitPercent}%, 100% ${textSplitPercent}%, 100% 100%, 0 100%)`
                }}
              >
                <div 
                  key={`conclusion-light-${animationKey}`}
                  className={`conclusion-content animated-text ${animationClass}`}
                >
                  <h1>我享受山顶的云海，也喜爱海边的日出。</h1>
                  <p>我很庆幸自己敢于攀登，勇于探寻，留下了这些文字、音频和影像。</p>
                  <p>它们如同一本厚厚的书，记载了我的记忆与感受，亦如一条纽带，联系着每一位共鸣者你。</p>
                  <p>朋友，感谢你光临我的个人网页并读到了这里，祝你活的潇洒，笑口常开！</p>
                </div>
              </div>

              {/* 黑色文字层（用于白背景） - 处于上半屏 */}
              <div 
                className="conclusion-layer layer-dark"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${textSplitPercent}%, 0 ${textSplitPercent}%)`
                }}
              >
                <div 
                  key={`conclusion-dark-${animationKey}`}
                  className={`conclusion-content animated-text ${animationClass}`}
                >
                  <h1>我享受山顶的云海，也喜爱海边的日出。</h1>
                  <p>我很庆幸自己敢于攀登，勇于探寻，留下了这些文字、音频和影像。</p>
                  <p>它们如同一本厚厚的书，记载了我的记忆与感受，亦如一条纽带，联系着每一位共鸣者你。</p>
                  <p>朋友，感谢你光临我的个人网页并读到了这里，祝你活的潇洒，笑口常开！</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero block - 在200vh-260vh位置，非sticky内容，高度60vh */}
        <div className="hero-block">
          <h1 className="hero-title">心在旷野</h1>
          <div className="hero-subtitle">天苍苍，野茫茫<br />风吹草低见牛羊</div>
        </div>
      </div>
      {/* 底部导航内容 - 正常文档流 */}
      <div className="conclusion-drawer">
        <div className="drawer-inner">
          <div className="drawer-reveal">
            <div className="drawer-content">
              <div className="drawer-toprow">
                <div className="drawer-breadcrumb">主页</div>
                <div className="drawer-search">
                  <input className="drawer-search-input" placeholder="搜索tianyezhou.com" />
                  <span className="drawer-search-icon">🔍</span>
                </div>
              </div>

            <div className="drawer-links">
              <div className="drawer-col">
                <div className="drawer-col-title">关于我</div>
                <a>我的生命钟</a>
                <a>另一侧面的我</a>
              </div>
              <div className="drawer-col">
                <div className="drawer-col-title">过往与当下</div>
                <a>沧海拾遗</a>
                <a>随游随想</a>
                <a>如我所书</a>
              </div>
              <div className="drawer-col">
                <div className="drawer-col-title">服务和产品</div>
                <a>留连·简历/文书翻译修改工具</a>
                <a>梦小蝶·AI 留学小助手</a>
              </div>
              <div className="drawer-col">
                <div className="drawer-col-title">快捷链接</div>
                <a>探知拾趣-学习笔记管理系统</a>
                <a>常备长青-行为习惯管理系统</a>
                <a>星海航线-网页导航推荐系统</a>
                <a>关于本站 & 无障碍</a>
              </div>
            </div>

              <div className="drawer-info-row">
                <div className="drawer-info-left">周天野的个人主页</div>
                <div className="drawer-info-right">社交平台：
                  <a>QQ</a> &nbsp;
                  <a>WeChat</a> &nbsp;
                  <a>LinkedIn</a> &nbsp;
                  <a>Facebook</a> &nbsp;
                  <a>Instagram</a> &nbsp;
                </div>
              </div>

              <div className="drawer-legalbar">
                <div className="drawer-copy">版权所有 © 2023-2025 周天野</div>
                <div className="drawer-legal-links">
                  <a>联系我</a>
                  <a>隐私政策</a>
                  <a>使用条款</a>
                  <a>Cookies</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Conclusion;

