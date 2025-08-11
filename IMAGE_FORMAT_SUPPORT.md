# 图片格式兼容性支持

本项目已实现多种图片格式的兼容性支持，确保无论文件名后缀是什么格式（jpg、jpeg、png、webp等）都能正常显示。

## 实现方式

### 1. CSS 回退方案（推荐）

浏览器会自动尝试加载多个背景图片，直到找到可用的格式：

```css
.banner {
  background-image: 
    url('/img/banner.webp'),    /* 优先尝试 WebP */
    url('/img/banner.png'),     /* 其次 PNG */
    url('/img/banner.jpg'),     /* 再次 JPG */
    url('/img/banner.jpeg');    /* 最后 JPEG */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

**优点：**
- 简单易用
- 浏览器自动处理
- 无需 JavaScript
- 性能良好

**缺点：**
- 可能下载多个图片
- 不支持动态检测

### 2. JavaScript 动态检测

使用提供的工具函数动态检测可用的图片格式：

```javascript
import { setBackgroundImage } from '../utils/imageFormatSupport';

// 设置单个元素的背景
await setBackgroundImage(
  document.querySelector('.hero-bg'),
  '/img/conclusion',
  ['webp', 'png', 'jpg', 'jpeg'],
  {
    size: '100% 260%',
    position: 'center',
    repeat: 'no-repeat'
  }
);

// 批量设置多个元素
await setMultipleBackgrounds({
  '.banner1': '/img/banner1',
  '.banner2': '/img/banner2',
  '.banner3': '/img/banner3'
});
```

**优点：**
- 只下载可用的图片
- 动态检测格式
- 支持错误处理
- 可配置选项

**缺点：**
- 需要 JavaScript
- 异步加载
- 稍微复杂

## 使用方法

### 添加新的图片支持

1. **准备多种格式的图片文件：**
   ```
   public/img/
   ├── myimage.webp
   ├── myimage.png
   ├── myimage.jpg
   └── myimage.jpeg
   ```

2. **在 CSS 中使用：**
   ```css
   .my-element {
     background-image: 
       url('/img/myimage.webp'),
       url('/img/myimage.png'),
       url('/img/myimage.jpg'),
       url('/img/myimage.jpeg');
     background-size: cover;
     background-position: center;
   }
   ```

3. **或在 JavaScript 中使用：**
   ```javascript
   import { setBackgroundImage } from '../utils/imageFormatSupport';
   
   useEffect(() => {
     setBackgroundImage(
       elementRef.current,
       '/img/myimage'
     );
   }, []);
   ```

### 预加载图片

```javascript
import { preloadImages } from '../utils/imageFormatSupport';

// 预加载图片以提高性能
preloadImages('/img/banner1');
preloadImages('/img/banner2');
```

## 支持的格式

按优先级排序：
1. **WebP** - 现代浏览器支持，文件小
2. **PNG** - 无损压缩，支持透明
3. **JPG** - 有损压缩，文件小
4. **JPEG** - JPG 的别名

## 注意事项

1. **文件命名：** 确保所有格式的图片文件名相同（除了扩展名）
2. **路径一致：** 所有格式的图片应放在同一目录下
3. **性能考虑：** CSS 回退方案可能下载多个图片，JavaScript 方案只下载一个
4. **浏览器支持：** 现代浏览器都支持这些格式，旧浏览器会自动回退

## 示例

查看以下文件了解具体实现：
- `src/components/Story/Story.css` - 轮播图背景
- `src/components/Conclusion/Conclusion.css` - Hero 背景
- `src/utils/imageFormatSupport.js` - 工具函数

## 维护建议

1. 添加新图片时，同时提供多种格式
2. 优先使用 WebP 格式（文件小，质量好）
3. 定期检查图片文件是否存在
4. 考虑使用图片压缩工具优化文件大小 