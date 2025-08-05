import React, { useState } from 'react';
import './StudyPath.css';

function StudyPath() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [animationDirection, setAnimationDirection] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // 主题段落内容
  const mainContent = `在别人眼里，上学是一件苦差事；可在我看来，它更像一场寻乐的大冒险——毕竟我从小就不是什么省油的灯。我的求学之路曲折而精彩，十七载如白驹过隙，转眼间我已站在学生生涯的终点`;

  const mainSubtitle = "点击时间节点回顾我的学生生涯...";

  // 时间轴数据
  const timelineData = [
    {
      year: "2008",
      school: "北京市景泰小学",
      content: "从当天发录取的优等生到天天大家谓请家长的学生。谁说一落千丈然后东山再起不是一种快感呢？是天真烂漫的年华，是无忧无虑的时光。"
    },
    {
      year: "2011", 
      school: "德州市解放北路小学",
      content: "持强凌弱的同学，袖手旁观的老师，疼得呲牙咧嘴的我。是黑历史，是鬼故事，塑造了我后来的一切。"
    },
    {
      year: "2014",
      school: "德州市第九中学", 
      content: "空子钻了不少，坏蛋也当了几回，得罪人的事时有发生，脸皮从始至终厚如城墙。好在被善意包围着蜕变，觉醒，成长。是似真似假的梦，是一个学生本该拥有的真实。"
    },
    {
      year: "2016",
      school: "北京市广渠门中学",
      content: "心态不稳，身体抱态，孤立无援，迷茫无助。与世隔绝的孤独感自那时起，如影随形，直至如今。是心力交瘁的岁月，是痛苦而漫长的光阴。"
    },
    {
      year: "2017", 
      school: "北京市第一零九中学",
      content: '总是"稳如泰山"，经常"静如止水"，鲜有"力不从心"，从未"新颖脱俗"。永远"光脚的不怕穿鞋的"，即使"有鞋"，也宁愿"光脚"，我自此活在自己的「欢愉」中。是敢想敢做的年代，是热血沸腾的昭华。'
    },
    {
      year: "2020",
      school: "香港城市大学",
      content: "主线四平八稳，细节起伏不平。那又如何？2.48的GPA逆风翻盘，我能吹一辈子！是心神不宁的流年，是险些迷失自己的春秋。"
    },
    {
      year: "2024",
      school: "卡内基梅隆大学", 
      content: "依旧山高水长，依旧精彩纷呈，敬请期待。"
    }
  ];

  const handleTimelineClick = (item, index) => {
    if (!selectedYear) {
      // 从初始状态进入，使用原地浮现效果
      setSelectedYear(item);
      setSelectedIndex(index);
      setAnimationDirection('fade-in');
      
      setTimeout(() => {
        setAnimationDirection(null);
      }, 400);
    } else {
      const currentIndex = timelineData.findIndex(data => data.year === selectedYear.year);
      if (index !== currentIndex) {
        // 更新选中的节点索引
        setSelectedIndex(index);
        
        // 第一阶段：旧内容浮出
        if (index > currentIndex) {
          setAnimationDirection('exit-up'); // 旧内容向上浮出
        } else {
          setAnimationDirection('exit-down'); // 旧内容向下浮出
        }
        
        // 第二阶段：新内容浮入
        setTimeout(() => {
          setSelectedYear(item);
          if (index > currentIndex) {
            setAnimationDirection('enter-up'); // 新内容从下方向上浮入
          } else {
            setAnimationDirection('enter-down'); // 新内容从上方向下浮入
          }
          
          // 清除动画状态
          setTimeout(() => {
            setAnimationDirection(null);
          }, 400);
        }, 400);
      }
    }
  };

  return (
    <div className="study-path-page">
      <div className="study-path-container">
        <div className="content-section">
          <div className="text-content">
            <div className={`content-wrapper ${animationDirection ? animationDirection : ''}`}>
              {selectedYear ? (
                <>
                  <div className="timeline-year">{selectedYear.year}</div>
                  <div className="timeline-school">{selectedYear.school}</div>
                  <div className="timeline-description">{selectedYear.content}</div>
                </>
              ) : (
                <>
                  <div className="main-content">{mainContent}</div>
                  <div className="main-subtitle">{mainSubtitle}</div>
                </>
              )}
            </div>
          </div>
          
          <div className="timeline-section">
            <div className="timeline-container">
              <div className="timeline-line"></div>
              {timelineData.map((item, index) => {
                const isSelected = selectedIndex === index;
                
                return (
                  <div 
                    key={item.year}
                    className={`timeline-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTimelineClick(item, index)}
                  >
                    <div className="timeline-dot"></div>
                    <div className="timeline-label">
                      <span className="timeline-year-label">{item.year}</span>
                      <span className="timeline-school-label">{item.school}</span>
                    </div>
                  </div>
                );
              })}
              <div className="timeline-arrow">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M10 2 L18 10 L10 18 L14 10 Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyPath;