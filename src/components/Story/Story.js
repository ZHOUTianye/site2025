import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './Story.css';

function Story({ isActive, onScrollProgress, onBoundaryScroll }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [swiperEnabled, setSwiperEnabled] = useState(false); // swiper启用状态
  const [lastScrollProgress, setLastScrollProgress] = useState(0); // 记录上次滚动位置

  const hasStartedRef = useRef(false);
  const containerRef = useRef(null);
  const swiperRef = useRef(null); // swiper实例引用

  // 文本内容
  const textLines = [
    "学学学，书呆子就知道学，都学傻了！",
    "喂！说谁书呆子呢！",
    "他急了，他急了...",
    "他宝贝的小可爱...🙄"
  ];

  // 轮播内容
  const swiperSlides = [
    { id: 1, content: "路上人生新旅途——匹兹堡见！" },
    { id: 2, content: "探索未知的世界，拥抱新的挑战" },
    { id: 3, content: "每一步都是成长，每一天都是新开始" }
  ];

  // 计算遮罩层的动态样式
  const getMaskStyle = useCallback(() => {
    // 动画开始点：100vh/260vh ≈ 38.5%
    // 动画结束点：95%
    const animationStartPoint = 150 / 260; // 38.5%
    const animationEndPoint = 0.95; // 95%
    
    // 只有在滚动超过100vh后才开始动画
    if (scrollProgress < animationStartPoint) {
      // 滚动未到100vh，无遮罩效果
      return {
        maskImage: 'none',
        WebkitMaskImage: 'none'
      };
    }
    
    // 重新映射进度：从38.5%-95%映射到0-100%
    const normalizedProgress = (scrollProgress - animationStartPoint) / (animationEndPoint - animationStartPoint);
    const animationProgress = Math.min(Math.max(normalizedProgress, 0), 1);
    
    // 根据屏幕尺寸调整遮罩范围
    const screenWidth = window.innerWidth;
    let containerWidth, startWidth, endWidth;
    
    if (screenWidth <= 480) {
      containerWidth = 380;
      startWidth = 380;
      endWidth = 350;
    } else if (screenWidth <= 768) {
      containerWidth = 630;
      startWidth = 630;
      endWidth = 600;
    } else if (screenWidth <= 1024) {
      containerWidth = 930;
      startWidth = 930;
      endWidth = 900;
    } else {
      containerWidth = 1350;
      startWidth = 1350;
      endWidth = 1200;
    }
    
    const currentWidth = startWidth - (startWidth - endWidth) * animationProgress;
    const maskOffset = (containerWidth - currentWidth) / 2;
    
    // 圆角从0px线性增加到20px
    const currentRadius = 0 + (20 - 0) * animationProgress;
    
    // 创建圆角矩形遮罩
    const maskPath = `inset(0 ${maskOffset}px round ${currentRadius}px)`;
    
    return {
      maskImage: `clip-path(${maskPath})`,
      WebkitMaskImage: `clip-path(${maskPath})`,
      clipPath: maskPath
    };
  }, [scrollProgress]);

  // 计算梯形的动态样式
  const getTrapezoidStyle = useCallback(() => {
    // 动画开始点和结束点与遮罩相同
    const animationStartPoint = 150 / 260;
    const animationEndPoint = 0.95;
    
    // 只有在滚动超过150vh后才开始动画
    if (scrollProgress < animationStartPoint) {
      return {
        leftTrapezoid: { 
          transform: 'translateX(0%)',
          opacity: 1
        },
        rightTrapezoid: { 
          transform: 'translateX(0%)',
          opacity: 1
        }
      };
    }
    
    // 重新映射进度：从animationStartPoint到animationEndPoint映射到0-100%
    const normalizedProgress = (scrollProgress - animationStartPoint) / (animationEndPoint - animationStartPoint);
    const animationProgress = Math.min(Math.max(normalizedProgress, 0), 1);
    
    // 梯形移动距离：从0%移动到±100%，但限制在合理范围内
    const moveDistance = Math.min(animationProgress * 100, 100);
    
    return {
      leftTrapezoid: { 
        transform: `translateX(-${moveDistance}%)`,
        opacity: Math.max(1 - animationProgress * 0.3, 0.7), // 确保不会完全透明
        willChange: 'transform, opacity' // 优化性能
      },
      rightTrapezoid: { 
        transform: `translateX(${moveDistance}%)`,
        opacity: Math.max(1 - animationProgress * 0.3, 0.7), // 确保不会完全透明
        willChange: 'transform, opacity' // 优化性能
      }
    };
  }, [scrollProgress]);

  // 控制swiper启用/禁用逻辑
  useEffect(() => {
    const threshold = 0.95; // 95%阈值
    const isScrollingDown = scrollProgress > lastScrollProgress;
    const isScrollingUp = scrollProgress < lastScrollProgress;
    
    // 更新上次滚动位置
    setLastScrollProgress(scrollProgress);
    
    // 控制swiper状态的函数
    const enableSwiper = () => {
      setSwiperEnabled(true);
      // 启动自动轮播
      setTimeout(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          swiperRef.current.autoplay.start();
        }
      }, 100); // 延迟确保swiper已初始化
    };
    
    const disableSwiper = () => {
      setSwiperEnabled(false);
      // 暂停自动轮播
      if (swiperRef.current && swiperRef.current.autoplay) {
        swiperRef.current.autoplay.stop();
      }
    };
    
    // 到达95%且向下滚动时启用swiper
    if (scrollProgress >= threshold && isScrollingDown && !swiperEnabled) {
      enableSwiper();
    }
    
    // 向上滚动时禁用swiper（无论在什么位置）
    if (isScrollingUp && swiperEnabled) {
      disableSwiper();
    }
  }, [scrollProgress, lastScrollProgress, swiperEnabled]);

  // 检测页面是否激活，开始动画
  useEffect(() => {
    if (isActive && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setAnimationStarted(true);
    }
  }, [isActive]);

  // 打字机效果
  useEffect(() => {
    if (!animationStarted) return;
    
    if (currentLineIndex < textLines.length) {
      const currentLine = textLines[currentLineIndex];
      
      if (currentCharIndex < currentLine.length) {
        const timer = setTimeout(() => {
          setDisplayedLines(prev => {
            const newLines = [...prev];
            if (newLines[currentLineIndex]) {
              newLines[currentLineIndex] += currentLine[currentCharIndex];
            } else {
              newLines[currentLineIndex] = currentLine[currentCharIndex];
            }
            return newLines;
          });
          setCurrentCharIndex(prev => prev + 1);
        }, 150); // 每个字符的打字速度

        return () => clearTimeout(timer);
      } else {
        // 当前行打完，等待一下再开始下一行
        const timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 0); // 换行等待时间

        return () => clearTimeout(timer);
      }
    }
  }, [currentCharIndex, currentLineIndex, textLines, animationStarted]);

  // 光标闪烁效果
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);





  // 更新滚动进度（为触控板优化）
  const updateScrollProgress = useCallback(() => {
    const container = containerRef.current;
    if (!container || !onScrollProgress) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    
    setScrollProgress(progress);
    onScrollProgress(Math.max(0, Math.min(1, progress)));
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
    const normalizedDeltaY = event.deltaMode === 1
      ? event.deltaY * 16
      : event.deltaMode === 2
        ? event.deltaY * window.innerHeight
        : event.deltaY;
    const absDeltaY = Math.abs(normalizedDeltaY);
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
    
    const deltaY = event.deltaMode === 1
      ? event.deltaY * 16
      : event.deltaMode === 2
        ? event.deltaY * window.innerHeight
        : event.deltaY;
    
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
  }, [onBoundaryScroll, smoothScrollTo]);

  // 统一的wheel事件分发器
  const handleWheel = useCallback((event) => {
    if (isMouseWheel(event)) {
      handleMouseWheel(event);
    } else {
      handleTouchpadWheel(event);
    }
  }, [isMouseWheel, handleMouseWheel, handleTouchpadWheel]);

  // 滚动处理
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive) return;

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
  }, [isActive, handleWheel, updateScrollProgress, handleTouchpadBoundary]);

  return (
    <div 
      ref={containerRef}
      className="story-page"
    >
      <div className="story-container">
        {/* 第一部分：聊天对话 (0-100vh) */}
        <div className="story-content">
          <div className="chat-container">
            {displayedLines.map((line, index) => {
              const isCurrentTypingLine = index === currentLineIndex && currentLineIndex < textLines.length;
              const isCompletedLine = index < currentLineIndex;
              
              // 只显示有内容的行或正在打字的行
              if (!line && !isCurrentTypingLine) return null;
              
              return (
                <div key={index} className={`chat-bubble ${index % 2 === 0 ? 'right' : 'left'}`}>
                  <div className="bubble-content">
                    {line}
                    {isCurrentTypingLine && showCursor && (
                      <span className="cursor">|</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 第二部分：新内容区域 (100vh-260vh) */}
        <div className="story-second-section">
          <div className="second-content">
            <div className="second-title">
              一用心学习起来总是忙忙碌碌，<br />
              但这并不妨碍我追求丰富多彩的生活。
            </div>
            <div 
              className="story-swiper-mask"
              style={getMaskStyle()}
            >
              {/* 左侧梯形 */}
              <div 
                className="trapezoid-left"
                style={getTrapezoidStyle().leftTrapezoid}
              ></div>
              {/* 右侧梯形 */}
              <div 
                className="trapezoid-right"
                style={getTrapezoidStyle().rightTrapezoid}
              ></div>
              <div className="story-swiper-container">
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  
                  // 监听自动播放进度 - 提高更新频率
                  let animationFrameId;
                  const handleAutoplayProgress = (s, time, progress) => {
                    // 取消之前的动画帧
                    if (animationFrameId) {
                      cancelAnimationFrame(animationFrameId);
                    }
                    
                    // 使用requestAnimationFrame确保更流畅的动画
                    animationFrameId = requestAnimationFrame(() => {
                      const bullet = s.pagination.bullets[s.activeIndex];
                      if (bullet && bullet.querySelector('.progress-fill')) {
                        // 横向胶囊和圆形都使用横向填充
                        const progressPercent = (1 - progress) * 100;
                        const progressFill = bullet.querySelector('.progress-fill');
                        
                        // 所有状态统一使用横向进度填充
                        progressFill.style.width = `${progressPercent}%`;
                        progressFill.style.height = '100%';
                      }
                    });
                  };
                  
                  swiper.on('autoplayTimeLeft', handleAutoplayProgress);
                  
                  // 清理函数：组件卸载时移除事件监听和取消动画帧
                  return () => {
                    if (animationFrameId) {
                      cancelAnimationFrame(animationFrameId);
                    }
                    swiper.off('autoplayTimeLeft', handleAutoplayProgress);
                  };
                }}
                modules={[Pagination, Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                speed={1000}
                effect="fade"
                fadeEffect={{
                  crossFade: true
                }}
                autoplay={swiperEnabled ? {
                  delay: 5000,
                  disableOnInteraction: false,
                } : false}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: false,
                  enabled: true,
                  renderBullet: (index, className) => {
                    return `
                      <span class="${className}">
                        <span class="progress-fill"></span>
                      </span>`;
                  }
                }}
                allowTouchMove={swiperEnabled}
                className={`story-swiper ${swiperEnabled ? 'enabled' : 'disabled'}`}
              >
                {swiperSlides.map((slide) => (
                  <SwiperSlide key={slide.id}>
                    <div className="slide-content">
                      {slide.content}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Story;