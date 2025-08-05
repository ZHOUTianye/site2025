import React, { useEffect, useRef, useCallback, useState } from 'react';
import './Personality.css';

const Personality = ({ onBoundaryScroll, onScrollProgress }) => {
  const containerRef = useRef(null);
  const stickyContentRef = useRef(null); // 缓存DOM引用
  const [textSplitPercent, setTextSplitPercent] = useState(100);
  const [showFunnyText, setShowFunnyText] = useState(false); // 控制"乐子人"文字显示
  const [isPageVisible, setIsPageVisible] = useState(false); // 控制动画触发时机
  const [emojiOpacity, setEmojiOpacity] = useState(0); // 控制emoji背景透明度
  const [strikethroughProgress, setStrikethroughProgress] = useState(0); // 控制删除线进度 (0-100)
  
  // 计算每个词的删除线进度
  const calculateIndividualProgress = useCallback((wordIndex, totalProgress) => {
    // 字符长度比例：勤奋的，(4) | 乐于探险的，(6) | 充满好奇心的，(7) | 善于反思的(5)
    const charCounts = [4, 6, 7, 5];
    const totalChars = 22;
    
    // 计算累计比例
    let cumulativePercent = 0;
    for (let i = 0; i < wordIndex; i++) {
      cumulativePercent += (charCounts[i] / totalChars) * 100;
    }
    
    const wordPercent = (charCounts[wordIndex] / totalChars) * 100;
    const wordStartPercent = cumulativePercent;
    const wordEndPercent = cumulativePercent + wordPercent;
    
    if (totalProgress <= wordStartPercent) {
      return 0; // 还没开始划这个词
    } else if (totalProgress >= wordEndPercent) {
      return 100; // 这个词已经完全划完
    } else {
      // 正在划这个词，计算进度
      return ((totalProgress - wordStartPercent) / wordPercent) * 100;
    }
  }, []);

  // 更新滚动进度（为触控板优化）
  const updateScrollProgress = useCallback(() => {
    const container = containerRef.current;
    if (!container || !onScrollProgress) return;

    // 检查第三页是否在视口中
    const containerRect = container.getBoundingClientRect();
    const isVisible = containerRect.top < window.innerHeight && containerRect.bottom > 0;
    
    console.log('🔍 Personality页面调试信息:', {
      containerTop: containerRect.top,
      containerBottom: containerRect.bottom,
      windowHeight: window.innerHeight,
      isVisible: isVisible
    });
    
    if (!isVisible) {
      // 不在视口中，保持黑字状态
      console.log('📍 页面不可见，设置textSplitPercent = 100 (黑字)');
      setTextSplitPercent(100);
      setEmojiOpacity(0); // 页面不可见时emoji透明
      setStrikethroughProgress(0); // 页面不可见时重置删除线
      setIsPageVisible(false);
      return;
    }

    // 页面变为可见时，延迟触发动画
    if (!isPageVisible) {
      setIsPageVisible(true);
      console.log('🎬 页面变为可见，触发入场动画');
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    
    onScrollProgress(Math.max(0, Math.min(1, progress)));

    // 计算删除线进度：在滚动进度30%-80%之间逐渐出现删除线
    let strikethroughValue = 0;
    if (progress >= 0.3 && progress <= 0.8) {
      strikethroughValue = ((progress - 0.3) / 0.5) * 100; // 将30%-80%映射到0%-100%
    } else if (progress > 0.8) {
      strikethroughValue = 100;
    }
    setStrikethroughProgress(Math.max(0, Math.min(100, strikethroughValue)));

    // 计算文字分割百分比 - 使用缓存的DOM引用
    const viewportHeight = window.innerHeight;
    const whiteAreaBottom = viewportHeight * (1 - progress);
    
    // 使用缓存的引用，避免重复DOM查询
    const stickyContent = stickyContentRef.current;
    if (stickyContent) {
      const contentRect = stickyContent.getBoundingClientRect();
      const contentTop = contentRect.top;
      const contentBottom = contentRect.bottom;
      const contentHeight = contentRect.height;
      
      console.log('📊 文字分割计算:', {
        progress: progress.toFixed(3),
        scrollTop,
        maxScroll,
        viewportHeight,
        whiteAreaBottom: whiteAreaBottom.toFixed(1),
        contentTop: contentTop.toFixed(1),
        contentBottom: contentBottom.toFixed(1),
        contentHeight: contentHeight.toFixed(1)
      });
      
      // 计算分界线与文字内容的关系
      if (whiteAreaBottom <= contentTop) {
        console.log('🔴 whiteAreaBottom <= contentTop，设置textSplitPercent = 0 (白字)');
        setTextSplitPercent(0);
        setEmojiOpacity(0.4); // 完全在黑色背景区域，emoji完全显示
        // 在完全滚动到底部（背景全黑）时显示"乐子人"文字
        setShowFunnyText(true);
      } else if (whiteAreaBottom >= contentBottom) {
        console.log('⚫ whiteAreaBottom >= contentBottom，设置textSplitPercent = 100 (黑字)');
        setTextSplitPercent(100);
        setEmojiOpacity(0); // 完全在白色背景区域，emoji完全透明
        setShowFunnyText(false);
      } else {
        const splitPercent = ((whiteAreaBottom - contentTop) / contentHeight) * 100;
        const finalPercent = Math.max(0, Math.min(100, splitPercent));
        console.log('🎯 文字分割中，textSplitPercent =', finalPercent.toFixed(1));
        setTextSplitPercent(finalPercent);
        // emoji透明度：分界线上方(白色背景)透明，下方(黑色背景)显示
        // finalPercent越小，黑色区域越多，emoji越显示
        const emojiOpacityValue = (100 - finalPercent) / 100 * 0.4;
        setEmojiOpacity(emojiOpacityValue);
        setShowFunnyText(false);
      }
    }
  }, [onScrollProgress]);

  // 平滑滚动到指定位置（仅用于鼠标滚轮）
  const smoothScrollTo = useCallback((targetY) => {
    const container = containerRef.current;
    if (!container) return;

    const startY = container.scrollTop;
    const distance = targetY - startY;
    const duration = 400; // 缩短动画时间，让鼠标滚轮更灵敏
    let startTime = null;

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // 使用easeOutQuad缓动函数，更轻快
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      
      container.scrollTop = startY + distance * easedProgress;
      
      // 实时更新滚动进度
      updateScrollProgress();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [updateScrollProgress]);



  // 快速设备检测（仅用于鼠标滚轮）
  const isMouseWheel = useCallback((event) => {
    const absDeltaY = Math.abs(event.deltaY);
    const absDeltaX = Math.abs(event.deltaX);
    
    // 鼠标滚轮特征：
    // 1. 无横向滚动
    // 2. deltaY较大且是整数倍（通常120的倍数）
    // 3. deltaMode通常为1（行模式）或有规律的数值
    return absDeltaX === 0 && 
           (absDeltaY >= 100 || absDeltaY % 120 === 0 || event.deltaMode === 1);
  }, []);

  // 触控板边界检测（通过scroll事件）
  const handleTouchpadBoundary = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    // 只在边界位置才可能触发页面切换
    // 这个状态会被wheel事件检查
    container.dataset.atTop = isAtTop;
    container.dataset.atBottom = isAtBottom;
  }, []);

  // 专门处理触控板（在wheel事件中快速退出）
  const handleTouchpadWheel = useCallback((event) => {
    const container = containerRef.current;
    if (!container) return;
    
    const deltaY = event.deltaY;
    const isAtTop = container.dataset.atTop === 'true';
    const isAtBottom = container.dataset.atBottom === 'true';
    
    // 只在边界时阻止默认行为并触发页面切换
    if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
      event.preventDefault();
      if (onBoundaryScroll) {
        onBoundaryScroll(deltaY > 0 ? 'down' : 'up');
      }
    }
    // 其他情况让触控板完全原生滚动
  }, [onBoundaryScroll]);

  // 专门处理鼠标滚轮（完全自定义）
  const handleMouseWheel = useCallback((event) => {
    const container = containerRef.current;
    if (!container) return;
    
    event.preventDefault();
    
    const deltaY = event.deltaY;
    
    // 检查边界
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
      if (onBoundaryScroll) {
        onBoundaryScroll(deltaY > 0 ? 'down' : 'up');
      }
      return;
    }
    
    // 平滑滚动
    const scrollAmount = deltaY * 1.8;
    const currentScrollTop = container.scrollTop;
    const targetScrollTop = currentScrollTop + scrollAmount;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const clampedTarget = Math.max(0, Math.min(maxScroll, targetScrollTop));
    
    smoothScrollTo(clampedTarget);
    
    // 调试输出
    if (process.env.NODE_ENV === 'development') {
      console.log(`鼠标滚轮: deltaY=${deltaY}, 滚动到=${clampedTarget}`);
    }
  }, [onBoundaryScroll, smoothScrollTo]);

  // 统一的wheel事件分发器
  const handleWheel = useCallback((event) => {
    if (isMouseWheel(event)) {
      handleMouseWheel(event);
    } else {
      handleTouchpadWheel(event);
    }
  }, [isMouseWheel, handleMouseWheel, handleTouchpadWheel]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // wheel事件：分发给鼠标滚轮或触控板处理器
      container.addEventListener('wheel', handleWheel, { passive: false });
      
      // scroll事件：处理滚动进度更新和触控板边界检测
      const handleScroll = () => {
        updateScrollProgress();
        handleTouchpadBoundary();
      };
      
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // 初始化
      updateScrollProgress();
      handleTouchpadBoundary();
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleWheel, updateScrollProgress, handleTouchpadBoundary]);

  return (
    <div className="personality-container" ref={containerRef}>
      {/* 合并的两屏容器 */}
      <div className="combined-screens">
        {/* Sticky内容 */}
        <div className="sticky-content" ref={stickyContentRef}>

          {/* 文字分割容器 */}
          <div className="text-split-container">
            {/* 黑色文字版本（适用于白色背景） */}
            <div 
              className="text-layer text-dark" 
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${textSplitPercent}%, 0 ${textSplitPercent}%)`
              }}
            >
              <h1 className={`personality-title ${isPageVisible ? 'animate-title' : ''}`}>我是一个</h1>
              <div className="personality-traits">
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-1' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(0, strikethroughProgress)}%` }}
                >
                  勤奋的，
                </div>
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-2' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(1, strikethroughProgress)}%` }}
                >
                  乐于探险的，
                </div>
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-3' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(2, strikethroughProgress)}%` }}
                >
                  充满好奇心的，
                </div>
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-4' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(3, strikethroughProgress)}%` }}
                >
                  善于反思的
                </div>
              </div>
              <h2 className={`personality-subtitle ${isPageVisible ? 'animate-subtitle' : ''}`}>人</h2>
              {/* 乐子人文字 - 黑字版本 */}
              <div 
                className={`funny-text funny-text-dark ${showFunnyText ? 'slide-in-right' : 'slide-out-right'}`}
                style={{
                  opacity: showFunnyText ? 1 : 0,
                  visibility: showFunnyText ? 'visible' : 'hidden'
                }}
              >
                才怪！我是一个名副其实的<a href="#" className="rainbow-text">乐子人</a>
              </div>
              <div className="scroll-hint">
                <div className="scroll-arrow">↓</div>
                <p>滚动查看更多</p>
              </div>
            </div>
            
            {/* 白色文字版本（适用于黑色背景） */}
            <div 
              className="text-layer text-light" 
              style={{
                clipPath: `polygon(0 ${textSplitPercent}%, 100% ${textSplitPercent}%, 100% 100%, 0 100%)`
              }}
            >
              <h1 className={`personality-title ${isPageVisible ? 'animate-title' : ''}`}>我是一个</h1>
              <div className="personality-traits">
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-1' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(0, strikethroughProgress)}%` }}
                >
                  勤奋的，
                </div>
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-2' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(1, strikethroughProgress)}%` }}
                >
                  乐于探险的，
                </div>
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-3' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(2, strikethroughProgress)}%` }}
                >
                  充满好奇心的，
                </div>
                <div 
                  className={`trait-item ${isPageVisible ? 'animate-trait-4' : ''}`}
                  style={{ '--individual-strikethrough-progress': `${calculateIndividualProgress(3, strikethroughProgress)}%` }}
                >
                  善于反思的
                </div>
              </div>
              <h2 className={`personality-subtitle ${isPageVisible ? 'animate-subtitle' : ''}`}>人</h2>
              {/* 乐子人文字 - 白字版本 */}
              <div 
                className={`funny-text funny-text-light ${showFunnyText ? 'slide-in-right' : 'slide-out-right'}`}
                style={{
                  opacity: showFunnyText ? 1 : 0,
                  visibility: showFunnyText ? 'visible' : 'hidden'
                }}
              >
                才怪！我是一个名副其实的<a href="#" className="rainbow-text">乐子人</a>
              </div>
              <div className="scroll-hint">
                <div className="scroll-arrow">↓</div>
                <p>滚动查看更多</p>
              </div>
            </div>
          </div>
        </div>
        <div className="all-sticky-content">
          {/* 黑色背景层 - 拖底层 */}
          <div className="black-background-layer"></div>
        
          {/* 表情包背景层 - 分割式 */}
          <div className="emoji-split-container">
            {/* 上层emoji（分界线上方）- 始终透明 */}
            <div 
              className="emoji-background emoji-upper"
              style={{
                opacity: 0, // 始终透明
                clipPath: `polygon(0 0, 100% 0, 100% ${textSplitPercent}%, 0 ${textSplitPercent}%)`
              }}
            ></div>
            
            {/* 下层emoji（分界线下方）- 动态透明度 */}
            <div 
              className="emoji-background emoji-lower"
              style={{
                opacity: emojiOpacity, // 动态透明度
                clipPath: `polygon(0 ${textSplitPercent}%, 100% ${textSplitPercent}%, 100% 100%, 0 100%)`
              }}
            ></div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Personality; 