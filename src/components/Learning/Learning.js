import React, { useState, useEffect } from 'react';
import './Learning.css';

function Learning() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 左侧内容
  const content = {
    text: "尽管我即将离开学校，可我始终认为学习就是我的宿命。一包辣条，一壶红茶，一台电脑，我就能当一天学习的“孙子”。我喜欢专注于自己感兴趣的领域，把学到的内容动手变成一个个小项目。与此同时，我乐于将学习心得整理成笔记，希望能对你有所帮助。"
  };

  // 轮播内容 - 临时数据，后续可以替换为实际的学习项目
  const swiperItems = [
    {
      id: 1,
      title: "项目一",
      description: "学习项目描述",
      color: "#FF6B6B"
    },
    {
      id: 2,
      title: "项目二", 
      description: "学习项目描述",
      color: "#4ECDC4"
    },
    {
      id: 3,
      title: "项目三",
      description: "学习项目描述", 
      color: "#45B7D1"
    },
    {
      id: 4,
      title: "项目四",
      description: "学习项目描述",
      color: "#96CEB4"
    },
    {
      id: 5,
      title: "项目五",
      description: "学习项目描述",
      color: "#FFEAA7"
    }
  ];

  // 自动轮播逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % swiperItems.length);
        
        // 动画完成后重置状态
        setTimeout(() => {
          setIsAnimating(false);
        }, 800);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating, swiperItems.length]);

  // 悬停暂停功能
  const handleMouseEnter = () => {
    setIsAnimating(true); // 阻止自动轮播
  };

  const handleMouseLeave = () => {
    setIsAnimating(false); // 恢复自动轮播
  };

  // 获取slide的样式
  const getSlideStyle = (index) => {
    const currentPos = (index - currentIndex + swiperItems.length) % swiperItems.length;
    
    switch (currentPos) {
      case 0: // 当前激活slide
        return {
          zIndex: 5,
          transform: 'translate(-50%, -50%) scale(1) rotateY(0deg)',
          opacity: 1,
        };
      case 1: // 第二张
        return {
          zIndex: 4,
          transform: 'translate(-50%, -50%) scale(0.95) rotateY(-15deg) translateX(30px)',
          opacity: 0.8,
        };
      case 2: // 第三张
        return {
          zIndex: 3,
          transform: 'translate(-50%, -50%) scale(0.9) rotateY(-30deg) translateX(60px)',
          opacity: 0.6,
        };
      case 3: // 第四张
        return {
          zIndex: 2,
          transform: 'translate(-50%, -50%) scale(0.85) rotateY(-45deg) translateX(90px)',
          opacity: 0.4,
        };
      case 4: // 第五张
        return {
          zIndex: 1,
          transform: 'translate(-50%, -50%) scale(0.8) rotateY(-60deg) translateX(120px)',
          opacity: 0.2,
        };
      default:
        return {
          zIndex: 0,
          transform: 'translate(-50%, -50%) scale(0.75) rotateY(-75deg) translateX(150px)',
          opacity: 0,
        };
    }
  };

  return (
    <div className="learning-page">
      <div className="learning-container">
        <div className="content-section">
          {/* 左侧文字内容 */}
          <div className="text-content">
            <div className="learning-content">{content.text}</div>
          </div>
          
          {/* 右侧立体轮播 */}
          <div className="swiper-section">
            <div 
              className="swiper-container"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="swiper-wrapper">
                {swiperItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`swiper-slide ${isAnimating ? 'animating' : ''}`}
                    style={{ 
                      backgroundColor: item.color,
                      ...getSlideStyle(index)
                    }}
                  >
                    <div className="slide-content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Learning;