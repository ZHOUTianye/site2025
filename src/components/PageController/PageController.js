import React, { useState, useEffect, useRef, useCallback } from 'react';
import Welcome from '../Welcome/Welcome';
import Sayhi from '../Sayhi/Sayhi';
import Personality from '../Personality/Personality';
import StudyPath from '../StudyPath/StudyPath';
import Learning from '../Learning/Learning';
import Story from '../Story/Story';
import Gallery from '../Gallery/Gallery';
import Conclusion from '../Conclusion/Conclusion';
import NavigationMenu from '../NavigationMenu/NavigationMenu';
import './PageController.css';

const PageController = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [previousPage, setPreviousPage] = useState(null); // 新增：跟踪来源页面
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasSelectedAction, setHasSelectedAction] = useState(false); // 跟踪用户是否已在Sayhi页面选择action
  const [personalityScrollProgress, setPersonalityScrollProgress] = useState(0); // Personality页面滚动进度
  const [storyScrollProgress, setStoryScrollProgress] = useState(0); // Story页面滚动进度
  const [galleryScrollProgress, setGalleryScrollProgress] = useState(0); // Gallery页面滚动进度
  const [conclusionScrollProgress, setConclusionScrollProgress] = useState(0); // Conclusion页面滚动进度（用于文字）
  const [conclusionIndicatorProgress, setConclusionIndicatorProgress] = useState(0); // Conclusion页面滚动进度副本（用于指示器）
  const containerRef = useRef(null);
  const lastScrollTimeRef = useRef(0);
  const scrollThreshold = 50; // 滚动阈值
  const transitionDuration = 800; // 过渡时间

  const changePage = useCallback((pageIndex) => {
    if (pageIndex === currentPage || isTransitioning) return;
    
    // 检查权限：如果用户没有在Sayhi页面选择action，不能跳转到第三页及以后
    if (!hasSelectedAction && pageIndex >= 2) {
      return;
    }
    
    setPreviousPage(currentPage); // 记录来源页面
    setIsTransitioning(true);
    setCurrentPage(pageIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  }, [currentPage, isTransitioning, transitionDuration, hasSelectedAction]);

  // 处理用户在Sayhi页面选择action
  const handleActionSelected = useCallback((action) => {
    console.log('用户选择了action:', action);
    setHasSelectedAction(true);
  }, []);

  // 处理Personality页面滚动进度
  const handlePersonalityScrollProgress = useCallback((progress) => {
    setPersonalityScrollProgress(progress);
  }, []);

  // 处理Story页面滚动进度
  const handleStoryScrollProgress = useCallback((progress) => {
    setStoryScrollProgress(progress);
  }, []);

  // 处理Gallery页面滚动进度
  const handleGalleryScrollProgress = useCallback((progress) => {
    setGalleryScrollProgress(progress);
  }, []);

  // 处理Conclusion页面滚动进度
  const handleConclusionScrollProgress = useCallback((progress) => {
    setConclusionScrollProgress(progress);
  }, []);

  // 回到顶部按钮点击：当在 Conclusion 页面时跳转回 Welcome 页面
  const handleBackToTopClick = useCallback(() => {
    if (currentPage !== 7) return;
    // Welcome 在索引 0
    changePage(0);
  }, [currentPage, changePage]);

  // 接收 Conclusion 复制出的进度，用于未来独立控制 indicator dot（当前不改变任何逻辑）
  const handleConclusionIndicatorProgress = useCallback((progress) => {
    setConclusionIndicatorProgress(progress);
  }, []);

  // 计算指定indicator dot的分界线信息
  const getDotSplitInfo = useCallback((dotIndex) => {
    // Personality（索引2）与 Conclusion（索引7）需要分割效果
    if (currentPage !== 2 && currentPage !== 7) {
      // 其他页面使用固定样式
      // StudyPath（索引3）、Learning（索引4）、Story（索引5）、Gallery（索引6）均为深色背景页面
      const isBlackBackgroundPage = currentPage === 3 || currentPage === 4 || currentPage === 5 || currentPage === 6;
      
      if (isBlackBackgroundPage) {
        return { type: 'solid', color: 'black', splitPercent: 0 };
      } else {
        return { type: 'solid', color: 'white', splitPercent: 0 };
      }
    }
    
    // 分割页面的分割逻辑：根据滚动位置和dot位置计算
    const viewportHeight = window.innerHeight;
    
    const isConclusion = currentPage === 7;
    const scrollProgress = isConclusion ? conclusionScrollProgress : personalityScrollProgress;
    // Personality: 白在上，使用白色区域底部；Conclusion: 白在下，使用白色区域顶部
    let whiteBoundary;
    if (currentPage === 7) {
      whiteBoundary = viewportHeight * (1 - 2*scrollProgress);
    } else {
      whiteBoundary = viewportHeight * (1 - scrollProgress);
    }
    
    // 获取indicator容器和实际dots的位置
    const indicatorContainer = document.querySelector('.page-indicator');
    if (!indicatorContainer) return { type: 'solid', color: 'white', splitPercent: 0 };
    
    // 获取所有indicator dots的实际DOM元素
    const allDots = indicatorContainer.querySelectorAll('.indicator-dot');
    if (!allDots[dotIndex]) return { type: 'solid', color: 'white', splitPercent: 0 };
    
    // 获取当前dot的实际位置和尺寸
    const dotElement = allDots[dotIndex];
    const dotRect = dotElement.getBoundingClientRect();
    
    const dotTop = dotRect.top;
    const dotBottom = dotRect.bottom;
    const dotHeight = dotRect.height;
    
    // 判断dot与分界线的关系（根据页面不同调整语义）
    if (!isConclusion) {
      // Personality：白色在上
      if (whiteBoundary <= dotTop) {
        return { type: 'solid', color: 'black', splitPercent: 0 };
      } else if (whiteBoundary >= dotBottom) {
        return { type: 'solid', color: 'white', splitPercent: 0 };
      } else {
        const splitPercent = ((whiteBoundary - dotTop) / dotHeight) * 100;
        const clampedPercent = Math.max(0, Math.min(100, splitPercent));
        return { type: 'split', color: 'mixed', splitPercent: clampedPercent };
      }
    } else {
      // Conclusion：白色自下而上
      if (whiteBoundary <= dotTop) {
        // 分界线在dot上方 → dot 全白
        return { type: 'solid', color: 'white', splitPercent: 0 };
      } else if (whiteBoundary >= dotBottom) {
        // 分界线在dot下方 → dot 全黑
        return { type: 'solid', color: 'black', splitPercent: 0 };
      } else {
        const splitPercent = ((whiteBoundary - dotTop) / dotHeight) * 100;
        const clampedPercent = Math.max(0, Math.min(100, splitPercent));
        return { type: 'split', color: 'mixed', splitPercent: clampedPercent };
      }
    }
  }, [currentPage, personalityScrollProgress, storyScrollProgress, conclusionScrollProgress]);

  // 获取可访问的页面数量（用于指示器显示）
  const getAccessiblePageCount = useCallback(() => {
    if (!hasSelectedAction) {
      return 2; // 只显示Welcome和Sayhi页面
    }
    return 8; // 显示所有页面 (Welcome, Sayhi, Personality, StudyPath, Learning, Story, Gallery, Conclusion)
  }, [hasSelectedAction]);

  // 处理Personality页面的边界滚动
  const handlePersonalityBoundaryScroll = useCallback((direction) => {
    if (isTransitioning) return;
    
    const maxAccessiblePage = getAccessiblePageCount() - 1;
    
    if (direction === 'up' && currentPage > 0) {
      changePage(currentPage - 1);
    } else if (direction === 'down' && currentPage < maxAccessiblePage) {
      changePage(currentPage + 1);
    }
  }, [currentPage, isTransitioning, changePage, getAccessiblePageCount]);

  // 处理Story页面的边界滚动
  const handleStoryBoundaryScroll = useCallback((direction) => {
    if (isTransitioning) return;
    
    const maxAccessiblePage = getAccessiblePageCount() - 1;
    
    if (direction === 'up' && currentPage > 0) {
      changePage(currentPage - 1);
    } else if (direction === 'down' && currentPage < maxAccessiblePage) {
      changePage(currentPage + 1);
    }
  }, [currentPage, isTransitioning, changePage, getAccessiblePageCount]);

  // 处理Gallery页面的边界滚动
  const handleGalleryBoundaryScroll = useCallback((direction) => {
    if (isTransitioning) return;
    
    const maxAccessiblePage = getAccessiblePageCount() - 1;
    
    if (direction === 'up' && currentPage > 0) {
      changePage(currentPage - 1);
    } else if (direction === 'down' && currentPage < maxAccessiblePage) {
      changePage(currentPage + 1);
    }
  }, [currentPage, isTransitioning, changePage, getAccessiblePageCount]);

  // 创建页面组件，传递来源信息
  const pages = [
    { component: <Welcome />, name: 'welcome' },
    { 
      component: <Sayhi 
        previousPage={previousPage} 
        currentPage={currentPage} 
        onActionSelected={handleActionSelected} 
      />, 
      name: 'sayhi' 
    },
    {
      component: <Personality 
        onBoundaryScroll={handlePersonalityBoundaryScroll} 
        onScrollProgress={handlePersonalityScrollProgress} 
      />,
      name: 'personality'
    },
    {
      component: <StudyPath previousPage={previousPage} currentPage={currentPage} />,
      name: 'studyPath'
    },
    {
      component: <Learning previousPage={previousPage} currentPage={currentPage} />, 
      name: 'learning'
    },
    {
      component: <Story 
        isActive={currentPage === 5} 
        onScrollProgress={handleStoryScrollProgress}
        onBoundaryScroll={handleStoryBoundaryScroll}
      />, 
      name: 'story'
    },
    {
      component: <Gallery 
        isActive={currentPage === 6} 
        onScrollProgress={handleGalleryScrollProgress}
        onBoundaryScroll={handleGalleryBoundaryScroll}
      />, 
      name: 'gallery'
    },
    {
      component: (
        <Conclusion
          previousPage={previousPage}
          currentPage={currentPage}
          onScrollProgress={handleConclusionScrollProgress}
          onIndicatorProgress={handleConclusionIndicatorProgress}
          onBoundaryScroll={(direction) => {
            if (isTransitioning) return;
            const maxAccessiblePage = getAccessiblePageCount() - 1;
            if (direction === 'up' && currentPage > 0) {
              changePage(currentPage - 1);
            } else if (direction === 'down' && currentPage < maxAccessiblePage) {
              changePage(currentPage + 1);
            }
          }}
        />
      ),
      name: 'conclusion'
    }
  ];

  const handleWheel = useCallback((event) => {
    // 如果当前在 Personality、Story、Gallery、Conclusion 页面，不处理滚轮事件，让组件自己处理/原生滚动
    if (currentPage === 2 || currentPage === 5 || currentPage === 6 || currentPage === 7) { // 2:Personality, 5:Story, 6:Gallery, 7:Conclusion
      return;
    }
    
    event.preventDefault();
    
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 100 || isTransitioning) {
      return; // 防抖和防止过渡期间触发
    }

    // 统一各浏览器的滚轮单位：
    // deltaMode === 0: 像素；1: 行；2: 页
    const normalizeWheelDeltaY = (e) => {
      if (e.deltaMode === 1) {
        // return e.deltaY * 16; // 近似每行16px
                // Firefox 使用 "行" 作为滚动单位，
        // 直接使用 deltaY 往往小于阈值，导致滚动无效。
        // 这里将其放大到接近像素级别，以保持与其它浏览器一致。
        return e.deltaY * 100;
      }
      if (e.deltaMode === 2) {
        return e.deltaY * window.innerHeight; // 以一页高度估算
      }
      return e.deltaY;
    };

    const deltaY = normalizeWheelDeltaY(event);
    const maxAccessiblePage = getAccessiblePageCount() - 1;
    
    // 检查滚动速度是否超过阈值
    if (Math.abs(deltaY) > scrollThreshold) {
      if (deltaY > 0 && currentPage < maxAccessiblePage) {
        // 向下滚动，下一页（但不超过可访问的页面）
        changePage(currentPage + 1);
      } else if (deltaY < 0 && currentPage > 0) {
        // 向上滚动，上一页
        changePage(currentPage - 1);
      }
      lastScrollTimeRef.current = now;
    }
  }, [currentPage, isTransitioning, changePage, scrollThreshold, getAccessiblePageCount]);

  // 语言切换处理函数
  const handleLanguageSwitch = (lang) => {
    console.log(`切换到${lang}语言`);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  return (
    <>
      {/* 根据页面显示不同的按钮 */}
      {currentPage < 2 ? (
        // 前两页（Welcome和Sayhi）显示语言切换按钮
        <div className="global-language-switcher">
          <button 
            className="global-lang-btn"
            onClick={() => handleLanguageSwitch('en')}
          >
            Eng
          </button>
          <button 
            className="global-lang-btn"
            onClick={() => handleLanguageSwitch('es')}
          >
            Esp
          </button>
        </div>
      ) : (
        // 第三页开始显示导航菜单
        <NavigationMenu />
      )}

      {/* 页面指示器 / 回到顶部（Conclusion 页面 >90% 进度） */}
      <div className="page-indicator">
        {currentPage === 7 && conclusionScrollProgress > 0.9 ? (
          <button
            className="back-to-top-btn"
            onClick={handleBackToTopClick}
            title="回到顶部"
            aria-label="回到顶部"
          >
            ↑
          </button>
        ) : (
        Array.from({ length: getAccessiblePageCount() }, (_, index) => {
          const isPersonalityPage = index === 2;
          const isStoryPage = index === 5;
          const isGalleryPage = index === 6;
          const isConclusionPage = index === 7;
          const isCurrentPage = index === currentPage;
          const isPersonalityActive = isPersonalityPage && isCurrentPage;
          const isStoryActive = isStoryPage && isCurrentPage;
          const isGalleryActive = false; // Gallery 不使用胶囊风格
          const isConclusionActive = isConclusionPage && isCurrentPage;
          const splitInfo = getDotSplitInfo(index);
          
          // 生成动态样式
          let dynamicStyle = {};
          if (splitInfo.type === 'split') {
            // 分割效果：上半部分白背景样式，下半部分黑背景样式
            if (isCurrentPage) {
              // active状态的分割颜色
              dynamicStyle.background = `linear-gradient(to bottom, 
                #333333 0%, 
                #333333 ${splitInfo.splitPercent}%, 
                #ffffff ${splitInfo.splitPercent}%, 
                #ffffff 100%)`;
            } else {
              // 非active状态的分割颜色
              dynamicStyle.background = `linear-gradient(to bottom, 
                rgba(51, 51, 51, 0.3) 0%, 
                rgba(51, 51, 51, 0.3) ${splitInfo.splitPercent}%, 
                rgba(255, 255, 255, 0.3) ${splitInfo.splitPercent}%, 
                rgba(255, 255, 255, 0.3) 100%)`;
            }
            
            // 添加hover效果的CSS变量
            dynamicStyle['--split-percent'] = `${splitInfo.splitPercent}%`;
          }
          
          return (
            <div
              key={index}
              className={`indicator-dot ${isCurrentPage ? 'active' : ''} ${
                isPersonalityActive ? 'personality-capsule' : ''
              } ${
                isStoryActive ? 'story-capsule' : ''
              } ${
                isConclusionActive ? 'conclusion-capsule' : ''
              } ${splitInfo.color === 'black' ? 'dark-dot' : ''} ${
                splitInfo.type === 'split' ? 'split-dot' : ''
              }`}
              style={splitInfo.type === 'split' ? dynamicStyle : {}}
              onClick={() => changePage(index)}
              title={`第${index + 1}页`}
            >
              {(isPersonalityActive || isStoryActive || isConclusionActive) && (() => {
                // 计算胶囊进度条的样式
                const progress = isPersonalityActive
                  ? personalityScrollProgress
                  : isStoryActive
                    ? storyScrollProgress
                    : conclusionScrollProgress;
                const progressHeight = progress * 100;
                let progressStyle = { height: `${progressHeight}%` };
                
                if (splitInfo.type === 'split') {
                  // 在分割状态下，需要计算进度条内部的颜色分割
                  // 进度条的分割点 = (分界线位置 / 胶囊总高度) * 100
                  const progressSplitPercent = splitInfo.splitPercent;
                  
                  // 计算进度条内部的分割比例
                  // 如果进度条高度小于分界线位置，则全部为上半部分颜色
                  // 如果进度条高度大于分界线位置，则需要分割显示
                  
                  if (progressHeight <= progressSplitPercent) {
                    // 进度条完全在分界线上方，使用上半部分颜色（适合白背景的颜色）
                    progressStyle.background = '#333333';
                  } else if (progressSplitPercent <= 0) {
                    // 分界线在胶囊上方，进度条全部使用下半部分颜色（适合黑背景的颜色）
                    progressStyle.background = '#ffffff';
                  } else {
                    // 进度条跨越分界线，需要分割显示
                    const progressSplitRatio = (progressSplitPercent / progressHeight) * 100;
                    progressStyle.background = `linear-gradient(to bottom, 
                      #333333 0%, 
                      #333333 ${progressSplitRatio}%, 
                      #ffffff ${progressSplitRatio}%, 
                      #ffffff 100%)`;
                  }
                } else if (splitInfo.color === 'black') {
                  // 整个胶囊在黑色背景下，使用白色进度条
                  progressStyle.background = '#ffffff';
                } else {
                  // 整个胶囊在白色背景下，使用默认的深色进度条
                  progressStyle.background = '#333333';
                }
                
                return (
                  <div 
                    className="capsule-progress"
                    style={progressStyle}
                  />
                );
              })()}
            </div>
          );
        })
        )}
      </div>

      <div 
        ref={containerRef}
        className="page-controller"
        style={{
          transform: `translateY(-${currentPage * 100}vh)`,
          transition: isTransitioning ? `transform ${transitionDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1)` : 'none'
        }}
      >
        {pages.map((page, index) => (
          <div key={index} className="page-wrapper">
            {page.component}
          </div>
        ))}
      </div>
    </>
  );
};

export default PageController; 