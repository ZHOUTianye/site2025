import React, { useEffect } from 'react';
import './Loading.css';

function Loading({ onLoadComplete }) {
  useEffect(() => {
    const images = [
      'https://picsum.photos/id/1015/900/600',
      'https://picsum.photos/id/1016/900/600',
      'https://picsum.photos/id/1025/900/600',
      'https://picsum.photos/id/1035/900/600',
      'https://picsum.photos/id/1041/900/600',
      'https://picsum.photos/id/1043/900/600',
      'https://picsum.photos/id/1050/900/600',
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1062/900/600',
      'https://picsum.photos/id/1069/900/600',
      'https://picsum.photos/id/1074/900/600',
      'https://picsum.photos/id/1080/900/600',
      'https://picsum.photos/id/1084/900/600',
      'https://picsum.photos/id/1081/900/600',
      'https://picsum.photos/id/1082/900/600',
      'https://picsum.photos/id/1083/900/600'
    ];

    const preloadImage = src =>
      new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          if (!window.preloadedImages) {
            window.preloadedImages = {};
          }
          window.preloadedImages[src] = img;
          resolve();
        };
        img.onerror = resolve;
        img.src = src;
      });

    const loadAllImages = async () => {
      await Promise.allSettled(images.map(src => preloadImage(src)));
      onLoadComplete();
    };

    loadAllImages();
  }, [onLoadComplete]);

  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">Loading</p>
    </div>
  );
}

export default Loading;
