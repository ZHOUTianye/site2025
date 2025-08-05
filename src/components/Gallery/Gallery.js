import React, { useState, useEffect, useRef } from 'react';
import ColorThief from 'colorthief';
import './Gallery.css';

function Gallery({ isActive, onScrollProgress, onBoundaryScroll }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const [isFlipping, setIsFlipping] = useState(false);
  // 用于 TV 失真效果锁
  // const [isGlitching, setIsGlitching] = useState(false);
  // 存储主题色
  const [themeColor, setThemeColor] = useState('#ffffff');
  
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // 图片数据 - 16张3:2比例在线样例图
  const images = [
    { id: 1, src: 'https://picsum.photos/id/1015/900/600', title: '夕阳余晖', description: '窗边的温暖时光' },
    { id: 2, src: 'https://picsum.photos/id/1016/900/600', title: '清晨薄雾', description: '朦胧的美好开始' },
    { id: 3, src: 'https://picsum.photos/id/1025/900/600', title: '海天一色', description: '无垠的蓝色梦境' },
    { id: 4, src: 'https://picsum.photos/id/1035/900/600', title: '春意盎然', description: '生机勃勃的绿意' },
    { id: 5, src: 'https://picsum.photos/id/1041/900/600', title: '金色秋叶', description: '收获季节的温暖' },
    { id: 6, src: 'https://picsum.photos/id/1043/900/600', title: '薰衣草田', description: '紫色的浪漫时光' },
    { id: 7, src: 'https://picsum.photos/id/1050/900/600', title: '雨后清新', description: '洗涤心灵的纯净' },
    { id: 8, src: 'https://picsum.photos/id/1052/900/600', title: '阳光午后', description: '慵懒惬意的时光' },
    { id: 9, src: 'https://picsum.photos/id/1062/900/600', title: '梦幻黄昏', description: '如梦似幻的美景' },
    { id: 10, src: 'https://picsum.photos/id/1069/900/600', title: '晴空万里', description: '心旷神怡的开阔' },
    { id: 11, src: 'https://picsum.photos/id/1074/900/600', title: '暖阳如春', description: '温暖人心的光芒' },
    { id: 12, src: 'https://picsum.photos/id/1080/900/600', title: '森林深处', description: '静谧安然的绿荫' },
    { id: 13, src: 'https://picsum.photos/id/1084/900/600', title: '粉色黎明', description: '新一天的希望' },
    { id: 14, src: 'https://picsum.photos/id/1081/900/600', title: '云卷云舒', description: '自由自在的飘逸' },
    { id: 15, src: 'https://picsum.photos/id/1082/900/600', title: '紫色梦境', description: '神秘优雅的想象' },
    { id: 16, src: 'https://picsum.photos/id/1083/900/600', title: '宁静致远', description: '内心平和的境界' }
  ];

  // 处理小图悬浮切换 - 集成折痕翻页和TV换台效果
  const handleThumbnailHover = (index) => {
    if (index === currentImageIndex) return;

    const mainDisplay = containerRef.current.querySelector('.main-display');
    if (mainDisplay) {
      // —— 一：折痕动画 ——
      const newPageLayer = document.createElement('div');
      newPageLayer.className = 'new-page-layer';
      
      // 使用预加载的图片设置背景
      newPageLayer.style.backgroundImage = `url(${images[index].src})`;
      newPageLayer.style.backgroundSize = 'cover';
      newPageLayer.style.backgroundPosition = 'center';
      
      mainDisplay.appendChild(newPageLayer);
      
      // 播折痕动画
      // setTimeout(() => newPageLayer.classList.add('sweeping'), 50);
      
      // —— 二：TV 换台失真蒙版 —— 
      const glitch = document.createElement('div');
      glitch.className = 'glitch-mask';
      
      glitch.style.backgroundImage = `url(${images[index].src})`;
      glitch.style.backgroundSize = 'cover';
      glitch.style.backgroundPosition = 'center';
      
      mainDisplay.appendChild(glitch);
      
      // 播 TV 失真
      // setTimeout(() => glitch.classList.add('tv-switch'), 100);
      setTimeout(() => {
        newPageLayer.classList.add('sweeping');
        glitch.classList.add('sweeping');
      }, 50);
      // 延迟切换图片显示，确保折痕前保留旧图
      setTimeout(() => setCurrentImageIndex(index), 300);



      // 动画结束后清理
      const cleanup = () => {
        if (newPageLayer) newPageLayer.remove();
        if (glitch) glitch.remove();
      };
      
      // 取最长的动画时长（折痕0.3s，TV失真1s）
      setTimeout(cleanup, 1000);
    }
  };

  // 处理滚轮事件
  useEffect(() => {
    const handleWheel = (event) => {
      if (!isActive) return;
      
      const { deltaY } = event;
      const threshold = 50;
      
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          // 向下滚动，尝试到下一页
          if (onBoundaryScroll) {
            onBoundaryScroll('down');
          }
        } else {
          // 向上滚动，尝试到上一页
          if (onBoundaryScroll) {
            onBoundaryScroll('up');
          }
        }
      }
    };

    const container = containerRef.current;
    if (container && isActive) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isActive, onBoundaryScroll]);

  // 每次 currentImageIndex 改变后，用 ColorThief 抽色
  useEffect(() => {
    const currentImageSrc = images[currentImageIndex].src;
    
    // 检查预加载的图片缓存
    const preloadedImage = window.preloadedImages?.[currentImageSrc];
    if (preloadedImage) {
      const ct = new ColorThief();
      try {
        const [r, g, b] = ct.getColor(preloadedImage);
        setThemeColor(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        console.warn('ColorThief extraction failed:', e);
        // 使用备用颜色
        setThemeColor('#ffffff');
      }
    } else {
      // 降级到原有逻辑
      const img = imgRef.current;
      if (!img) return;
      
      const ct = new ColorThief();
      const tryGet = () => {
        try {
          const [r, g, b] = ct.getColor(img);
          setThemeColor(`rgb(${r}, ${g}, ${b})`);
        } catch (e) {
          setTimeout(tryGet, 100);
        }
      };
      
      if (img.complete) {
        tryGet();
      } else {
        img.addEventListener('load', tryGet);
      }
    }
  }, [currentImageIndex]);

  // 报告滚动进度（固定为100%，因为这是轮播页面）
  useEffect(() => {
    if (onScrollProgress) {
      onScrollProgress(1.0); // 始终报告100%进度
    }
  }, [onScrollProgress]);

  return (
    <div 
      ref={containerRef}
      className="gallery-page"
    >
      <div className="gallery-container">
        {/* 页面标题 */}
        <div className="gallery-header">
          <h1 
            className="gallery-title"
            style={{ color: themeColor }}
          >
            来看看我的照片墙吧！
          </h1>
        </div>
       

        {/* 照片墙主体 */}
        <div className="photo-wall">
          {/* 左侧缩略图网格 */}
          <div className="thumbnail-grid">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                style={{ 
                  backgroundImage: `url(${image.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onMouseEnter={() => handleThumbnailHover(index)}
              >
                <div className="thumbnail-plus">+</div>
              </div>
            ))}
          </div>
          {/* 分割线 */}
          <div className="gallery-divider">
          </div>
          {/* 右侧大图显示 */}
          <div className="main-display">
            {images.map((image, index) => (
              <img
                key={image.id}
                ref={index === currentImageIndex ? imgRef : null}
                className="main-image"
                src={image.src}
                alt={image.title}
                crossOrigin="anonymous"
                style={{
                  display: index === currentImageIndex ? 'block' : 'none',
                  opacity: window.preloadedImages?.[image.src] ? 1 : 0
                }}
              />
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}

export default Gallery;