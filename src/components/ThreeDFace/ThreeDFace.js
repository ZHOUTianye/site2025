import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import './ThreeDFace.css';

const ThreeDFace = ({ onDragComplete }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const sphereRef = useRef(null);
  const cameraRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [totalDistance, setTotalDistance] = useState({ x: 0, y: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);
  const animationIdRef = useRef(null);
  const faceTransitionRef = useRef(null);
  const throttleRef = useRef(null); // 新增：节流控制

  // 创建疑问表情纹理 - 仿照🤔
  const createFaceTexture = useMemo(() => {
    return () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // 背景 - 填满整个画布的黄色（表情包正黄色）
      ctx.fillStyle = '#FFDE00';
      ctx.fillRect(0, 0, 512, 512);

      // 眼睛 - 仿照🤔 emoji的眼睛（向下平移10px）
      ctx.fillStyle = '#222333';
      
      // 左眼 - 椭圆形
      ctx.beginPath();
      ctx.ellipse(110, 220, 9, 18, -0.03, 0, Math.PI * 2);
      ctx.fill();
      
      // 右眼 - 椭圆形
      ctx.beginPath();
      ctx.ellipse(152, 225, 9, 18, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // 疑问的嘴巴 - 一条线表示困惑
      ctx.strokeStyle = '#393733';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(115, 285);
      ctx.quadraticCurveTo(125, 275, 150, 290);
      // ctx.lineTo(142, 280);
      ctx.stroke();

      // 眉毛 - 疑问的形状，仿照🤔（向下平移10px）
      ctx.strokeStyle = '#393733';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      // 左眉毛 - 稍微弯曲的形状
      ctx.beginPath();
      ctx.moveTo(90, 205);
      ctx.quadraticCurveTo(100, 160, 120, 190);
      ctx.stroke();
      
      // 右眉毛 - 上挑表示疑问，与左眉对应
      ctx.beginPath();
      ctx.moveTo(142, 195);
      ctx.quadraticCurveTo(162, 185, 172, 190);
      ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.generateMipmaps = true;

      return texture;
    };
  }, []);

  // 新的表情纹理渲染函数
  const createReviseFaceTexture = useCallback((action, rotationY = 0) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (action === '点头') {
      // 开心表情 + 黄色背景
      ctx.fillStyle = '#FFDE00'; // 改回黄色背景
      ctx.fillRect(0, 0, 512, 512);

      // 脸颊红晕效果 - 根据旋转角度调整
      ctx.fillStyle = '#FF8E8E';
      
      // 计算左右脸颊的光照强度（基于Y轴旋转）
      const leftIntensity = Math.max(0.3, 0.8 + Math.sin(rotationY) * 0.5);
      const rightIntensity = Math.max(0.3, 0.8 - Math.sin(rotationY) * 0.5);
      
      // 左脸颊椭圆形红晕 - 强度随旋转变化，向中间靠拢并下移
      const leftBaseX = 100 + Math.sin(rotationY) * 5;
      const leftBaseY = 260;
      
      // 外层椭圆红晕（最淡）
      ctx.globalAlpha = leftIntensity * 0.15;
      ctx.beginPath();
      ctx.ellipse(leftBaseX, leftBaseY, 35, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 中层椭圆红晕
      ctx.globalAlpha = leftIntensity * 0.25;
      ctx.beginPath();
      ctx.ellipse(leftBaseX, leftBaseY, 25, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 内层椭圆红晕（最浓）
      ctx.globalAlpha = leftIntensity * 0.4;
      ctx.beginPath();
      ctx.ellipse(leftBaseX, leftBaseY, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 右脸颊椭圆形红晕 - 强度随旋转变化，向中间靠拢并下移
      const rightBaseX = 160 - Math.sin(rotationY) * 5;
      const rightBaseY = 260;
      
      // 外层椭圆红晕（最淡）
      ctx.globalAlpha = rightIntensity * 0.15;
      ctx.beginPath();
      ctx.ellipse(rightBaseX, rightBaseY, 35, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 中层椭圆红晕
      ctx.globalAlpha = rightIntensity * 0.25;
      ctx.beginPath();
      ctx.ellipse(rightBaseX, rightBaseY, 25, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 内层椭圆红晕（最浓）
      ctx.globalAlpha = rightIntensity * 0.4;
      ctx.beginPath();
      ctx.ellipse(rightBaseX, rightBaseY, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1.0; // 恢复不透明度

      // 眉毛 - 更舒缓的弯曲
      ctx.strokeStyle = '#222333';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      // 左眉毛 - 减小弯曲度
      ctx.beginPath();
      ctx.moveTo(90, 210);
      ctx.quadraticCurveTo(105, 190, 120, 200);
      ctx.stroke();
      
      // 右眉毛 - 减小弯曲度
      ctx.beginPath();
      ctx.moveTo(142, 200);
      ctx.quadraticCurveTo(157, 190, 172, 210);
      ctx.stroke();

      // 眼睛 - 在眉毛正下方，比眉毛较窄
      ctx.strokeStyle = '#222333';
      ctx.lineWidth = 8;
      
      // 左眼 - 月牙形，长度增加25%
      ctx.beginPath();
      ctx.moveTo(103, 240);
      ctx.quadraticCurveTo(112, 233, 121, 235);
      ctx.stroke();
      
      // 右眼 - 月牙形，长度增加25%
      ctx.beginPath();
      ctx.moveTo(141, 235);
      ctx.quadraticCurveTo(150, 233, 159, 240);
      ctx.stroke();

      // 横椭圆和竖椭圆相交形成的嘴巴
      ctx.strokeStyle = '#222333';
      ctx.lineCap = 'round';
      ctx.lineWidth = 3;
      
      const centerX = 131;
      const centerY = 285;
      const size = 15;
      
      // 横椭圆的中间弧段 - 从左交点到右交点（向下）
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size * 1.2, size * 0.8, 0, 0.2 * Math.PI, 0.8 * Math.PI, false);
      ctx.stroke();
      
      // 竖椭圆的中间弧段 - 从左交点到右交点，相同起终点（向下）
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size * 0.8, size * 1.2, 0, 0.2 * Math.PI, 0.8 * Math.PI, false);
      ctx.stroke();


    } else if (action === '摇头') {
      // 伤心表情 + 黑色背景
      ctx.fillStyle = '#333333'; // 黑色背景
      ctx.fillRect(0, 0, 512, 512);

      // TODO: 绘制伤心的表情
      // 眼睛 - 向下的眉毛表示伤心
      ctx.fillStyle = '#EEEEEE'; // 浅色眼睛在黑背景上
      // 左眼
      ctx.beginPath();
      ctx.ellipse(110, 220, 8, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      // 右眼
      ctx.beginPath();
      ctx.ellipse(152, 220, 8, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // 伤心的嘴巴 - 向下的弧形
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(131, 250, 25, Math.PI, 0, false);
      ctx.stroke();

      // 眉毛 - 向下表示伤心
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      // 左眉毛
      ctx.beginPath();
      ctx.moveTo(95, 190);
      ctx.lineTo(125, 200);
      ctx.stroke();
      // 右眉毛
      ctx.beginPath();
      ctx.moveTo(137, 200);
      ctx.lineTo(167, 190);
      ctx.stroke();

    } else {
      // 默认保持原来的疑问表情
      return createFaceTexture();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;

    return texture;
  }, [createFaceTexture]);



  // 新增：计算脸部相对鼠标的偏移
  const calculateFaceOffset = useCallback((mouseX, mouseY) => {
    if (!mountRef.current) return { x: 0, y: 0 };

    const canvas = mountRef.current.querySelector('canvas');
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const maxDistance = 300;
    const clampedDistance = Math.min(distance, maxDistance);
    const moveRatio = (clampedDistance / maxDistance) * 0.15;
    
    const angle = Math.atan2(deltaY, deltaX);
    const offsetX = Math.cos(angle) * moveRatio * 20;
    const offsetY = Math.sin(angle) * moveRatio * 20;

    return { x: offsetX, y: offsetY };
  }, []);



  // 新增：节流版本的更新函数
  const throttledUpdatePosition = useCallback((mouseX, mouseY) => {
    if (!throttleRef.current) {
      throttleRef.current = setTimeout(() => {
        const offset = calculateFaceOffset(mouseX, mouseY);
        const canvas = mountRef.current?.querySelector('canvas');
        if (canvas) {
          canvas.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        }
        throttleRef.current = null;
      }, 100);
    }
  }, [calculateFaceOffset]);



  // 新增：全局鼠标移动监听
  useEffect(() => {
    const handleGlobalMouseMove = (event) => {
      if (isInteractionDisabled) {
        // 使用节流版本的更新函数
        throttledUpdatePosition(event.clientX, event.clientY);
      }
    };

    if (isInteractionDisabled) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        if (throttleRef.current) {
          clearTimeout(throttleRef.current);
          throttleRef.current = null;
        }
      };
    }
  }, [isInteractionDisabled, throttledUpdatePosition]);

  // 新增：面部表情渐变动画函数
  const animateFaceTransition = useCallback((fromTexture, toTexture, action, duration = 500) => {
    if (!sphereRef.current) return;

    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // 创建混合纹理
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // 绘制原始纹理
      const fromCanvas = document.createElement('canvas');
      fromCanvas.width = 512;
      fromCanvas.height = 512;
      const fromCtx = fromCanvas.getContext('2d');
      fromCtx.drawImage(fromTexture.image, 0, 0);
      
      // 绘制目标纹理
      const toCanvas = document.createElement('canvas');
      toCanvas.width = 512;
      toCanvas.height = 512;
      const toCtx = toCanvas.getContext('2d');
      toCtx.drawImage(toTexture.image, 0, 0);
      
      // 混合两个纹理
      ctx.globalAlpha = 1 - easeOut;
      ctx.drawImage(fromCanvas, 0, 0);
      ctx.globalAlpha = easeOut;
      ctx.drawImage(toCanvas, 0, 0);
      ctx.globalAlpha = 1.0;
      
      const blendedTexture = new THREE.CanvasTexture(canvas);
      blendedTexture.magFilter = THREE.LinearFilter;
      blendedTexture.minFilter = THREE.LinearMipmapLinearFilter;
      blendedTexture.generateMipmaps = true;
      
      sphereRef.current.material.map = blendedTexture;
      sphereRef.current.material.needsUpdate = true;
      
      if (progress < 1) {
        faceTransitionRef.current = requestAnimationFrame(animate);
      } else {
        // 动画完成，设置最终纹理
        sphereRef.current.material.map = toTexture;
        sphereRef.current.material.needsUpdate = true;
        
        // 表情变化完成后禁用交互
        setIsInteractionDisabled(true);
      }
    };
    
    animate();
  }, []);

  // 更新球体纹理和材质 - 修改为支持渐变
  const updateSphereTexture = useCallback((action, rotationY = 0, useTransition = false) => {
    if (!sphereRef.current) return;

    const newTexture = createReviseFaceTexture(action, rotationY);
    
    if (useTransition && sphereRef.current.material.map) {
      // 使用渐变动画
      const currentTexture = sphereRef.current.material.map.clone();
      animateFaceTransition(currentTexture, newTexture, action);
    } else {
      // 直接更新纹理
      sphereRef.current.material.map = newTexture;
      sphereRef.current.material.needsUpdate = true;
    }
  }, [createReviseFaceTexture, animateFaceTransition]);

  // 限制旋转角度到36度
  const clampRotation = useCallback((rotation) => {
    const maxRotation = Math.PI / 5; // 36度
    return Math.max(-maxRotation, Math.min(maxRotation, rotation));
  }, []);

  // 回弹到原位置的动画 - 修改以支持表情渐变
  const animateReturn = useCallback((action) => {
    if (!sphereRef.current) return;

    const startRotation = { ...rotation };
    const targetRotation = { x: 0, y: 0 };
    const duration = 500; // 0.5秒
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentRotationX = startRotation.x + (targetRotation.x - startRotation.x) * easeOut;
      const currentRotationY = startRotation.y + (targetRotation.y - startRotation.y) * easeOut;
      
      sphereRef.current.rotation.x = currentRotationX;
      sphereRef.current.rotation.y = currentRotationY;
      
      setRotation({ x: currentRotationX, y: currentRotationY });
      
      // 在回弹过程中，如果已经有交互且是开心表情，实时更新红晕
      if (hasInteracted && currentAction === '点头') {
        updateSphereTexture('点头', currentRotationY);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setRotation({ x: 0, y: 0 });
        
        // 回弹完成后，如果是首次交互，更新表情纹理（使用渐变动画）
        if (!hasInteracted && action && (action === '点头' || action === '摇头')) {
          setHasInteracted(true);
          setCurrentAction(action);
          updateSphereTexture(action, 0, true); // 使用渐变动画
        } else if (hasInteracted && action === '点头') {
          // 如果已经交互过，确保最终状态纹理正确
          updateSphereTexture('点头', 0);
        }
      }
    };
    
    animate();
  }, [rotation, hasInteracted, currentAction, updateSphereTexture]);

  // 鼠标事件处理 - 修改以支持禁用交互
  const handleMouseDown = useCallback((event) => {
    if (isInteractionDisabled) return; // 如果交互被禁用，直接返回
    
    event.preventDefault();
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setTotalDistance({ x: 0, y: 0 });
  }, [isInteractionDisabled]);

  const handleMouseMove = useCallback((event) => {
    if (!isDragging || !sphereRef.current || isInteractionDisabled) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    // 累计总距离
    setTotalDistance(prev => ({
      x: prev.x + Math.abs(deltaX * 0.01),
      y: prev.y + Math.abs(deltaY * 0.01)
    }));

    // 计算旋转角度 (减小灵敏度)
    const rotationY = clampRotation(deltaX * 0.01);
    const rotationX = clampRotation(deltaY * 0.01);

    setRotation({ x: rotationX, y: rotationY });

    // 应用旋转
    sphereRef.current.rotation.x = rotationX;
    sphereRef.current.rotation.y = rotationY;

    // 如果已经有交互并且当前是开心表情，实时更新红晕效果
    if (hasInteracted && currentAction === '点头') {
      updateSphereTexture('点头', rotationY);
    }
  }, [isDragging, dragStart, clampRotation, hasInteracted, currentAction, updateSphereTexture, isInteractionDisabled]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || isInteractionDisabled) return;
    
    setIsDragging(false);
    
    // 判断是点头还是摇头
    const isNodding = totalDistance.y > totalDistance.x;
    const isShaking = totalDistance.x > totalDistance.y;
    const action = isNodding ? '点头' : isShaking ? '摇头' : '无明确动作';
    
    // 调用回调函数
    if (onDragComplete) {
      onDragComplete({
        totalDistance,
        action
      });
    }

    // 回弹动画，传递动作类型
    animateReturn(action);
  }, [isDragging, totalDistance, onDragComplete, animateReturn, isInteractionDisabled]);

  // 初始化Three.js场景
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 相机
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // 1:1宽高比
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, // 透明背景
      powerPreference: "high-performance", // 使用高性能GPU
      precision: "highp" // 高精度渲染
    });
    const size = 200; // 固定大小
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 设置像素比例提高清晰度
    renderer.setClearColor(0x000000, 0); // 透明背景
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 创建扁球体几何体 (椭球) - 人头形状，增加分辨率提高清晰度
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    // 压缩Z轴使其成为扁球
    geometry.scale(1, 1, 0.8);

    
    // 创建材质和纹理
    const texture = createFaceTexture();
    const material = new THREE.MeshLambertMaterial({ 
      map: texture,
      transparent: true
    });

    // 创建球体网格
    const sphere = new THREE.Mesh(geometry, material);
    
    // 默认朝前 - 不需要额外旋转，纹理已经正确朝向
    scene.add(sphere);
    sphereRef.current = sphere;

    // 添加环境光（降低强度以突出方向光效果）
    const ambientLight = new THREE.AmbientLight(0xE4BF11, 1.5);
    scene.add(ambientLight);

    // 添加方向光从头顶打下来，制造立体感
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(0, 5, 3.5); // 从头顶稍微偏前的位置照射
    directionalLight.target = sphere; // 光照目标设为头部
    scene.add(directionalLight);

    // 渲染循环
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 清理函数
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (faceTransitionRef.current) {
        cancelAnimationFrame(faceTransitionRef.current);
      }
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [createFaceTexture]);

  // 全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      className={`three-d-face ${isDragging ? 'dragging' : ''} ${isInteractionDisabled ? 'disabled' : ''}`}
      onMouseDown={isInteractionDisabled ? undefined : handleMouseDown}
    >
      <div ref={mountRef} />
    </div>
  );
};

export default ThreeDFace; 