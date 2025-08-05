import React, { useState, useEffect } from 'react';
import ThreeDFace from '../ThreeDFace/ThreeDFace';
import './Sayhi.css';

const Sayhi = ({ previousPage, currentPage, onActionSelected }) => {
  const [currentAction, setCurrentAction] = useState(null);
  const [timer, setTimer] = useState(null);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  // 预设网站数组
  const websites = [
    { name: '百度', url: 'https://www.baidu.com' },
    { name: 'DeepSeek', url: 'https://www.deepseek.com' },
    { name: '北京市政府', url: 'https://www.beijing.gov.cn' }
  ];

  // 当页面切换到Sayhi时重置状态（用于支持重新进入）
  useEffect(() => {
    if (currentPage === 1 && previousPage !== null) {
      // 页面切换时重置交互状态，让用户可以重新交互
      // 未来如果需要保持状态，可以在这里添加逻辑
    }
  }, [currentPage, previousPage]);

  const handleDragComplete = (result) => {
    console.log('拖拽结束:', result);
    const { action } = result;
    
    if (action === '点头' || action === '摇头') {
      setCurrentAction(action);
      
      // 通知父组件用户已选择action
      if (onActionSelected) {
        onActionSelected(action);
      }
      
      if (action === '摇头') {
        // 随机选择一个网站
        const randomWebsite = websites[Math.floor(Math.random() * websites.length)];
        setSelectedWebsite(randomWebsite);
        
        // 开始3秒倒计时
        setTimer(3);
      } else if (action === '点头') {
        // 开始打字机效果
        setIsTyping(true);
        setTypewriterText('');
      }
    }
  };

  // 处理点头情况的打字机效果
  useEffect(() => {
    if (currentAction === '点头' && isTyping) {
      const targetText = '向您介绍一下我自己';
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex < targetText.length) {
          setTypewriterText(targetText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 150);
      
      return () => clearInterval(typeInterval);
    }
  }, [currentAction, isTyping]);

  // 处理打字机完成后2秒延迟显示个人信息
  useEffect(() => {
    if (currentAction === '点头' && !isTyping && typewriterText === '向您介绍一下我自己') {
      const delayTimer = setTimeout(() => {
        setShowPersonalInfo(true);
      }, 2000);
      
      return () => clearTimeout(delayTimer);
    }
  }, [currentAction, isTyping, typewriterText]);

  // 处理摇头情况的倒计时
  useEffect(() => {
    if (currentAction === '摇头' && timer !== null && timer > 0) {
      const countdown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      
      return () => clearTimeout(countdown);
    } else if (currentAction === '摇头' && timer === 0) {
      if (selectedWebsite) {
        window.open(selectedWebsite.url, '_self');
      }
    }
  }, [timer, currentAction, selectedWebsite]);

  // 决定动画方向
  const getAnimationClass = () => {
    if (previousPage === null) {
      // 首次进入，默认向上浮入
      return 'slide-up';
    } else if (previousPage < currentPage) {
      // 向前导航（页面索引增加），向上浮入
      return 'slide-up';
    } else {
      // 向后导航（页面索引减少），向下沉入  
      return 'slide-down';
    }
  };

  // 如果显示个人信息，渲染新的界面
  if (showPersonalInfo) {
    const animationClass = getAnimationClass();
    
    return (
      <div className="sayhi-container">
        <div className="personal-info-content">
          <div className={`info-line info-line-1 ${animationClass}`}>
            我，周天野，2002年出生于中国北京市。
          </div>
          <div className={`info-line info-line-2 ${animationClass}`}>
            朋友们一般叫我天野/野哥。
          </div>
          <div className={`info-line info-line-3 ${animationClass}`}>
            我目前是一名学生，在卡内基梅隆大学攻读
          </div>
          <div className={`info-line info-line-4 ${animationClass}`}>
            土木环境工程硕士。
          </div>
          <div className={`info-line info-line-5 learn-more ${animationClass}`}>
            了解更多...
          </div>
        </div>
      </div>
    );
  }

  // 根据当前状态渲染标题
  const renderTitle = () => {
    if (currentAction === '点头') {
      return '太棒啦！';
    } else if (currentAction === '摇头') {
      return '这样吗...';
    }
    return '想要了解我？';
  };

  // 根据当前状态渲染指令文本
  const renderInstruction = () => {
    if (currentAction === '点头') {
      return (
        <span>
          {typewriterText}
          {isTyping && <span className="typewriter-cursor">|</span>}
        </span>
      );
    } else if (currentAction === '摇头' && selectedWebsite) {
      return `没关系！很高兴认识你！${timer}秒后 您将乘坐飞船飞往${selectedWebsite.name}`;
    }
    return '拖动小黄脸，摇头或是点头...';
  };

  return (
    <div className="sayhi-container">
      {/* 主要内容 */}
      <div className="sayhi-content">
        <h1 className="sayhi-title">{renderTitle()}</h1>
        
        <div className="face-container">
          <ThreeDFace onDragComplete={handleDragComplete} />
        </div>
        
        <p className="sayhi-instruction">{renderInstruction()}</p>
      </div>
    </div>
  );
};

export default Sayhi; 