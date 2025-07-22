// utils/content-processor.js
export function processWordPressContent(htmlContent) {
  if (!htmlContent) return '';
  
  // サーバーサイドではそのまま返す（SSG時はここで終了）
  if (typeof window === 'undefined') {
    // ✅ サーバーサイドでも文字列処理は実行
    return processAllStyleClasses(htmlContent);
  }
  
  // ✅ まず文字列処理でスタイルを適用
  let processedContent = processAllStyleClasses(htmlContent);
  
  // ブラウザ側でのDOM操作を実行
  const parser = new DOMParser();
  const doc = parser.parseFromString(processedContent, 'text/html');
  
  // Cocoonテーブル対応
  const tables = doc.querySelectorAll('table');
  tables.forEach(table => {
    table.classList.add('wp-block-table');
    
    const wrapper = doc.createElement('div');
    wrapper.classList.add('table-responsive');
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
  
  // YouTube対応
  const iframes = doc.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    const src = iframe.getAttribute('src') || '';
    
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      const wrapper = doc.createElement('div');
      wrapper.className = 'youtube-wrapper';
      iframe.parentNode.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
      
      iframe.removeAttribute('width');
      iframe.removeAttribute('height');
    }
  });
  
  // 吹き出し対応
  const speeches = doc.querySelectorAll('[class*="speech"]');
  speeches.forEach(speech => {
    if (!speech.classList.contains('speech-balloon')) {
      speech.classList.add('speech-balloon');
    }
  });
  
  // Snow Monkey Alert対応
  const alerts = doc.querySelectorAll('.smb-alert');
  alerts.forEach(alert => {
    if (!alert.classList.contains('smb-alert--info') && 
        !alert.classList.contains('smb-alert--warning') &&
        !alert.classList.contains('smb-alert--success') &&
        !alert.classList.contains('smb-alert--danger')) {
      alert.classList.add('smb-alert--info');
    }
  });
  
  // 画像対応
  const images = doc.querySelectorAll('img');
  images.forEach(img => {
    img.classList.add('wp-image');
  });
  
  return doc.body.innerHTML;
}

// ✅ 関数を外に出して使用
function processAllStyleClasses(content) {
  const styleMap = {
    // マーカー系
    'marker-under': 'background: linear-gradient(transparent 70%, #ff9 70%)',
    'marker-under-red': 'background: linear-gradient(transparent 70%, #e74c3c 70%)',
    'marker-under-blue': 'background: linear-gradient(transparent 70%, #66b3ff 70%)',
    'marker-under-green': 'background: linear-gradient(transparent 70%, #66ff66 70%)',
    
    // bold系
    'bold-red': 'font-weight: bold; color: #e60033',
    'bold-blue': 'font-weight: bold; color: #0066cc',
    'bold-green': 'font-weight: bold; color: #00cc00',
    'bold-orange': 'font-weight: bold; color: #ff8800',
    'bold-purple': 'font-weight: bold; color: #8800cc'
  };
  
  return content.replace(
    /<span([^>]*class="[^"]*(?:marker-under|bold-)[^"]*"[^>]*?)>(.*?)<\/span>/gi,
    (match, attributes, innerText) => {
      if (attributes.includes('style=')) {
        return match;
      }
      
      const appliedStyles = [];
      
      Object.keys(styleMap).forEach(className => {
        if (attributes.includes(className)) {
          appliedStyles.push(styleMap[className]);
        }
      });
      
      if (appliedStyles.length > 0) {
        const styleAttr = `style="${appliedStyles.join('; ')};"`;
        return `<span${attributes} ${styleAttr}>${innerText}</span>`;
      }
      
      return match;
    }
  );
}