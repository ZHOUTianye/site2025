/**
 * 图片格式支持工具
 * 提供多种图片格式的兼容性支持
 */

/**
 * 支持的图片格式列表（按优先级排序）
 */
export const SUPPORTED_FORMATS = ['webp', 'png', 'jpg', 'jpeg'];

/**
 * 检测图片是否可加载
 * @param {string} url - 图片URL
 * @returns {Promise<boolean>} - 图片是否可加载
 */
export const checkImageLoadable = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * 获取可用的图片格式
 * @param {string} basePath - 图片基础路径（不包含扩展名）
 * @param {string[]} formats - 要检测的格式数组
 * @returns {Promise<string>} - 第一个可用的图片URL
 */
export const getAvailableImage = async (basePath, formats = SUPPORTED_FORMATS) => {
  // 移除可能存在的扩展名
  const cleanBasePath = basePath.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  
  for (const format of formats) {
    const url = `${cleanBasePath}.${format}`;
    if (await checkImageLoadable(url)) {
      return url;
    }
  }
  
  // 如果都不可用，返回默认格式
  return `${cleanBasePath}.jpg`;
};

/**
 * 设置元素的背景图片，支持多种格式
 * @param {HTMLElement} element - 目标元素
 * @param {string} basePath - 图片基础路径
 * @param {string[]} formats - 要检测的格式数组
 * @param {Object} options - 背景样式选项
 */
export const setBackgroundImage = async (element, basePath, formats = SUPPORTED_FORMATS, options = {}) => {
  const {
    size = 'cover',
    position = 'center',
    repeat = 'no-repeat',
    fallback = null
  } = options;

  try {
    const availableImage = await getAvailableImage(basePath, formats);
    element.style.backgroundImage = `url('${availableImage}')`;
    element.style.backgroundSize = size;
    element.style.backgroundPosition = position;
    element.style.backgroundRepeat = repeat;
  } catch (error) {
    console.warn(`Failed to load image for ${basePath}:`, error);
    if (fallback) {
      element.style.backgroundImage = `url('${fallback}')`;
    }
  }
};

/**
 * 批量设置多个元素的背景图片
 * @param {Object} elements - 元素映射对象 {selector: basePath}
 * @param {string[]} formats - 要检测的格式数组
 * @param {Object} options - 背景样式选项
 */
export const setMultipleBackgrounds = async (elements, formats = SUPPORTED_FORMATS, options = {}) => {
  const promises = Object.entries(elements).map(([selector, basePath]) => {
    const element = document.querySelector(selector);
    if (element) {
      return setBackgroundImage(element, basePath, formats, options);
    }
  });
  
  await Promise.all(promises);
};

/**
 * CSS 回退方案生成器
 * 生成支持多种格式的 CSS 背景属性
 * @param {string} basePath - 图片基础路径
 * @param {string[]} formats - 要检测的格式数组
 * @returns {string} - CSS background-image 属性值
 */
export const generateCSSFallback = (basePath, formats = SUPPORTED_FORMATS) => {
  const cleanBasePath = basePath.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const urls = formats.map(format => `url('${cleanBasePath}.${format}')`);
  return urls.join(', ');
};

/**
 * 预加载图片以提高性能
 * @param {string} basePath - 图片基础路径
 * @param {string[]} formats - 要检测的格式数组
 */
export const preloadImages = (basePath, formats = SUPPORTED_FORMATS) => {
  const cleanBasePath = basePath.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  
  formats.forEach(format => {
    const img = new Image();
    img.src = `${cleanBasePath}.${format}`;
  });
};

export default {
  SUPPORTED_FORMATS,
  checkImageLoadable,
  getAvailableImage,
  setBackgroundImage,
  setMultipleBackgrounds,
  generateCSSFallback,
  preloadImages
}; 