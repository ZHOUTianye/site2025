import React, { useRef, useEffect, useCallback, useState } from 'react';
import './Conclusion.css';

function Conclusion() {
  const containerRef = useRef(null);
  const stickyContentRef = useRef(null);
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [textSplitPercent, setTextSplitPercent] = useState(0); // 从黑到白，初始黑色为0%

  const updateProgress = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) {
      setIsPageVisible(false);
      setTextSplitPercent(0);
      return;
    }
    if (!isPageVisible) setIsPageVisible(true);

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

    // 反向：黑 -> 白，因此白色从下半屏逐步占比增加
    const viewportHeight = window.innerHeight;
    const whiteAreaTop = viewportHeight * progress; // 从底部往上推白色

    const sticky = stickyContentRef.current;
    if (sticky) {
      const contentRect = sticky.getBoundingClientRect();
      const contentTop = contentRect.top;
      const contentBottom = contentRect.bottom;
      const contentHeight = contentRect.height;

      if (whiteAreaTop <= contentTop) {
        setTextSplitPercent(0); // 全黑
      } else if (whiteAreaTop >= contentBottom) {
        setTextSplitPercent(100); // 全白
      } else {
        const splitPercent = ((whiteAreaTop - contentTop) / contentHeight) * 100;
        const finalPercent = Math.max(0, Math.min(100, splitPercent));
        setTextSplitPercent(finalPercent);
      }
    }
  }, [isPageVisible]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => updateProgress();
    container.addEventListener('scroll', onScroll, { passive: true });
    updateProgress();
    return () => container.removeEventListener('scroll', onScroll);
  }, [updateProgress]);

  return (
    <div className="conclusion-container" ref={containerRef}>
      <div className="conclusion-combined">
        {/* 粘性内容 */}
        <div className="conclusion-sticky" ref={stickyContentRef}>
          <div className="conclusion-text-split">
            {/* 白色文字层（用于黑背景） - 处于下半屏，逐步扩大到整屏白 */}
            <div 
              className="conclusion-layer layer-light"
              style={{
                clipPath: `polygon(0 ${textSplitPercent}%, 100% ${textSplitPercent}%, 100% 100%, 0 100%)`
              }}
            >
              <div className="conclusion-content">
                <h1>我享受山顶的云海，也喜爱海边的日出。</h1>
                <p>我很庆幸自己敢于攀登，勇于探寻，留下了这些文字、音频和影像。</p>
                <p>它们如同一本厚厚的书，记载了我的记忆与感受，亦如一条纽带，联系着每一位共鸣者你。</p>
                <p>朋友，感谢你光临我的个人网页并读到了这里，祝你活的潇洒，笑口常开！</p>
              </div>
            </div>

            {/* 黑色文字层（用于白背景） - 处于上半屏 */}
            <div 
              className="conclusion-layer layer-dark"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${textSplitPercent}%, 0 ${textSplitPercent}%)`
              }}
            >
              <div className="conclusion-content">
                <h1>我享受山顶的云海，也喜爱海边的日出。</h1>
                <p>我很庆幸自己敢于攀登，勇于探寻，留下了这些文字、音频和影像。</p>
                <p>它们如同一本厚厚的书，记载了我的记忆与感受，亦如一条纽带，联系着每一位共鸣者你。</p>
                <p>朋友，感谢你光临我的个人网页并读到了这里，祝你活的潇洒，笑口常开！</p>
              </div>
            </div>
          </div>
        </div>

        {/* 背景从黑到白：放在普通文流层，避免覆盖粘性内容 */}
        <div className="conclusion-all-bg" />
      </div>
    </div>
  );
}

export default Conclusion;

