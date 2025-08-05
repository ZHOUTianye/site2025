import React, { useState, useEffect } from 'react';
import './Loading.css';

function Loading({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [currentLoadingImage, setCurrentLoadingImage] = useState('');

  // Gallery组件中的图片数据
  const images = [
    { id: 1, src: 'https://picsum.photos/id/1015/900/600', title: '夕阳余晖' },
    { id: 2, src: 'https://picsum.photos/id/1016/900/600', title: '清晨薄雾' },
    { id: 3, src: 'https://picsum.photos/id/1025/900/600', title: '海天一色' },
    { id: 4, src: 'https://picsum.photos/id/1035/900/600', title: '春意盎然' },
    { id: 5, src: 'https://picsum.photos/id/1041/900/600', title: '金色秋叶' },
    { id: 6, src: 'https://picsum.photos/id/1043/900/600', title: '薰衣草田' },
    { id: 7, src: 'https://picsum.photos/id/1050/900/600', title: '雨后清新' },
    { id: 8, src: 'https://picsum.photos/id/1052/900/600', title: '阳光午后' },
    { id: 9, src: 'https://picsum.photos/id/1062/900/600', title: '梦幻黄昏' },
    { id: 10, src: 'https://picsum.photos/id/1069/900/600', title: '晴空万里' },
    { id: 11, src: 'https://picsum.photos/id/1074/900/600', title: '暖阳如春' },
    { id: 12, src: 'https://picsum.photos/id/1080/900/600', title: '森林深处' },
    { id: 13, src: 'https://picsum.photos/id/1084/900/600', title: '粉色黎明' },
    { id: 14, src: 'https://picsum.photos/id/1081/900/600', title: '云卷云舒' },
    { id: 15, src: 'https://picsum.photos/id/1082/900/600', title: '紫色梦境' },
    { id: 16, src: 'https://picsum.photos/id/1083/900/600', title: '宁静致远' }
  ];

  useEffect(() => {
    const total = images.length;
    setTotalImages(total);
    let loaded = 0;

    const preloadImage = (src, title) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // 支持CORS，用于ColorThief
        
        img.onload = () => {
          loaded++;
          setLoadedImages(loaded);
          setProgress(Math.round((loaded / total) * 100));
          setCurrentLoadingImage(title);
          
          // 将图片存储到全局缓存对象中
          if (!window.preloadedImages) {
            window.preloadedImages = {};
          }
          window.preloadedImages[src] = img;
          
          resolve(img);
        };
        
        img.onerror = () => {
          loaded++;
          setLoadedImages(loaded);
          setProgress(Math.round((loaded / total) * 100));
          console.warn(`Failed to load image: ${src}`);
          reject(new Error(`Failed to load ${src}`));
        };
        
        img.src = src;
      });
    };

    const loadAllImages = async () => {
      try {
        // 并行加载所有图片
        const promises = images.map(image => 
          preloadImage(image.src, image.title)
        );
        
        await Promise.allSettled(promises);
        
        // 所有图片加载完成后，延迟一点时间显示100%进度
        setTimeout(() => {
          setCurrentLoadingImage('加载完成！');
          setTimeout(() => {
            onLoadComplete();
          }, 500);
        }, 300);
        
      } catch (error) {
        console.error('Error loading images:', error);
        // 即使有错误也继续进入主应用
        onLoadComplete();
      }
    };

    loadAllImages();
  }, [onLoadComplete]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-circle">
            <div className="logo-inner"></div>
          </div>
        </div>
        
        <h1 className="loading-title">正在加载资源...</h1>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            <span className="progress-percentage">{progress}%</span>
            <span className="progress-detail">
              ({loadedImages}/{totalImages}) {currentLoadingImage}
            </span>
          </div>
        </div>
        
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}

export default Loading;