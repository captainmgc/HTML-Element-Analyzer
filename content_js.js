// HTML Element Analyzer - Content Script

// Global değişkenler
let isActive = false; // Start in passive mode
let hoveredElement = null;
let originalOutline = "";
let lastSelectedElement = null;
let lastElementInfo = null;
let infoModalOpen = false;

// Element seçim modu paneli oluştur
function createSelectionPanel() {
  // Poppins font ekle
  if (!document.getElementById('poppins-font')) {
    const poppinsFont = document.createElement('link');
    poppinsFont.id = 'poppins-font';
    poppinsFont.rel = 'stylesheet';
    poppinsFont.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
    document.head.appendChild(poppinsFont);
  }

  const panel = document.createElement('div');
  panel.id = 'html-analyzer-panel';
  panel.innerHTML = `
    <div class="analyzer-panel-container">
      <button id="analyzer-select-element">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 320 512" fill="currentColor">
          <path d="M0 55.2V426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320H297.9c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z"/>
        </svg>
        Select
      </button>
      <button id="analyzer-info-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
        </svg>
        Info
      </button>
    </div>
  `;
  
  panel.style.cssText = `
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 999999;
    font-family: 'Poppins', sans-serif;
    width: 200px;
  `;
  
  document.body.appendChild(panel);
  
  // Info Modal oluştur
  const infoModal = document.createElement('div');
  infoModal.id = 'analyzer-info-modal';
  infoModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 9999999;
    font-family: 'Poppins', sans-serif;
  `;
  
  infoModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Element Information</h3>
        <button class="close-modal">×</button>
      </div>
      <div class="modal-body">
        <div class="no-element">
          <p>No element selected yet. Click "Select" button to pick an element.</p>
        </div>
        <div class="element-info" style="display: none;">
          <div class="info-group">
            <h4>Tag</h4>
            <div class="value-container">
              <div class="tag-value"></div>
              <button class="copy-item-button" data-copy-target="tag-value" title="Copy tag">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="info-group">
            <h4>ID</h4>
            <div class="value-container">
              <div class="id-value"></div>
              <button class="copy-item-button" data-copy-target="id-value" title="Copy ID">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="info-group">
            <h4>Classes</h4>
            <div class="value-container">
              <div class="classes-value"></div>
              <button class="copy-item-button" data-copy-target="classes-value" title="Copy classes">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="info-group">
            <h4>Dimensions</h4>
            <div class="value-container">
              <div class="dimensions-value"></div>
              <button class="copy-item-button" data-copy-target="dimensions-value" title="Copy dimensions">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="info-group">
            <h4>XPath</h4>
            <div class="value-container">
              <div class="xpath-value"></div>
              <button class="copy-item-button" data-copy-target="xpath-value" title="Copy XPath">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="info-group">
            <h4>Attributes</h4>
            <div class="value-container">
              <div class="attributes-value"></div>
              <button class="copy-item-button" data-copy-target="attributes-value" title="Copy attributes">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="info-group">
            <h4>Computed Style</h4>
            <div class="value-container">
              <div class="style-value"></div>
              <button class="copy-item-button" data-copy-target="style-value" title="Copy computed style">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a href="https://github.com/captainmgc" target="_blank" class="developer-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
          Developer
        </a>
      </div>
    </div>
  `;
  
  document.body.appendChild(infoModal);
  
  // Panel içi CSS stilleri
  const style = document.createElement('style');
  style.textContent = `
    .analyzer-panel-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 5px;
    }
    
    #analyzer-select-element, #analyzer-info-button {
      background-color: rgba(255, 255, 255, 0.75);
      color: #000000;
      border: none;
      padding: 0 10px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 30px;
      flex: 1;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      font-family: 'Poppins', sans-serif;
    }
    
    #analyzer-select-element svg, #analyzer-info-button svg {
      margin-right: 6px;
      fill: #000000;
    }
    
    #analyzer-select-element:hover, #analyzer-info-button:hover {
      background-color: rgba(255, 255, 255, 0.7);
    }
    
    #analyzer-info-modal .modal-content {
      background-color: white;
      border-radius: 8px;
      width: 500px;
      max-width: 90vw;
      max-height: 80vh;
      overflow: auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      font-family: 'Poppins', sans-serif;
      color: #000000;
    }
    
    #analyzer-info-modal .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #ddd;
    }
    
    #analyzer-info-modal .modal-header h3 {
      margin: 0;
      font-size: 18px;
      color: #000000;
      font-weight: 700;
    }
    
    #analyzer-info-modal .close-modal {
      background: none;
      border: none;
      font-size: 24px;
      color: #333;
      cursor: pointer;
    }
    
    #analyzer-info-modal .close-modal:hover {
      color: #000;
    }
    
    #analyzer-info-modal .modal-body {
      padding: 20px;
      color: #000000;
    }
    
    #analyzer-info-modal .info-group {
      margin-bottom: 15px;
      position: relative;
    }
    
    #analyzer-info-modal .info-group h4 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #000000;
      font-weight: 700;
      background-color: #e8e8e8;
      padding: 3px 8px;
      border-radius: 3px;
      display: inline-block;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    #analyzer-info-modal .tag-value {
      font-family: monospace;
      font-weight: bold;
      color: #c0392b;
      font-size: 15px;
    }
    
    #analyzer-info-modal .id-value {
      font-family: monospace;
      font-weight: bold;
      color: #2980b9;
      font-size: 15px;
    }
    
    #analyzer-info-modal .classes-value {
      font-family: monospace;
      font-weight: bold;
      color: #27ae60;
      font-size: 15px;
    }
    
    #analyzer-info-modal .xpath-value,
    #analyzer-info-modal .attributes-value,
    #analyzer-info-modal .dimensions-value,
    #analyzer-info-modal .style-value {
      font-family: monospace;
      background-color: #f0f0f0;
      padding: 8px;
      border-radius: 4px;
      max-height: 150px;
      overflow: auto;
      color: #000000;
      font-weight: bold;
      font-size: 14px;
      border: 1px solid #ddd;
      word-break: break-all;
    }
    
    #analyzer-info-modal .dimensions-value {
      color: #000000;
      font-weight: bold;
    }
    
    #analyzer-info-modal .xpath-value {
      color: #d35400;
    }
    
    #analyzer-info-modal .attributes-value {
      color: #8e44ad;
    }
    
    #analyzer-info-modal .style-value {
      color: #34495e;
    }
    
    #analyzer-info-modal .no-element {
      color: #000000;
      font-weight: 500;
      text-align: center;
      padding: 20px 0;
    }
    
    #analyzer-info-modal .value-container {
      display: flex;
      align-items: flex-start;
      position: relative;
    }
    
    #analyzer-info-modal .copy-item-button {
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
      margin-left: 5px;
      padding: 2px;
      vertical-align: middle;
      opacity: 0.7;
      transition: opacity 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    
    #analyzer-info-modal .copy-item-button:hover {
      opacity: 1;
      color: #000;
    }
    
    #analyzer-info-modal .copy-item-button svg {
      width: 14px;
      height: 14px;
    }
    
    #analyzer-info-modal .modal-footer {
      display: flex;
      justify-content: center;
      padding: 10px 20px 15px;
      border-top: 1px solid #ddd;
      margin-top: 10px;
    }
    
    #analyzer-info-modal .developer-button {
      background-color: #24292e;
      color: white;
      border: none;
      padding: 6px 12px;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      font-weight: bold;
    }
    
    #analyzer-info-modal .developer-button:hover {
      background-color: #0366d6;
    }
    
    #analyzer-info-modal .developer-button svg {
      margin-right: 6px;
      width: 16px;
      height: 16px;
    }
  `;
  document.head.appendChild(style);
  
  // Element seçim butonu tıklama olayı
  const selectButton = document.getElementById('analyzer-select-element');
  selectButton.addEventListener('click', toggleSelectionMode);
  
  // Info butonu tıklama olayı
  const infoButton = document.getElementById('analyzer-info-button');
  infoButton.addEventListener('click', toggleInfoModal);
  
  // Modal kapatma butonu olayı
  const closeModal = document.querySelector('#analyzer-info-modal .close-modal');
  closeModal.addEventListener('click', toggleInfoModal);
  
  // Modal dışına tıklanınca kapanması için
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      toggleInfoModal();
    }
  });
  
  // Modal kopyalama butonlarını ayarla
  setupModalCopyButtons();
}

// Info modalı aç/kapat
function toggleInfoModal() {
  const infoModal = document.getElementById('analyzer-info-modal');
  infoModalOpen = !infoModalOpen;
  
  if (infoModalOpen) {
    infoModal.style.display = 'flex';
    updateInfoModal();
  } else {
    infoModal.style.display = 'none';
  }
}

// Info modalını güncelle
function updateInfoModal() {
  if (!lastElementInfo) return;
  
  const infoModal = document.getElementById('analyzer-info-modal');
  const noElement = infoModal.querySelector('.no-element');
  const elementInfo = infoModal.querySelector('.element-info');
  
  noElement.style.display = 'none';
  elementInfo.style.display = 'block';
  
  // Bilgileri doldur
  infoModal.querySelector('.tag-value').textContent = lastElementInfo.tagName;
  infoModal.querySelector('.id-value').textContent = lastElementInfo.id || 'No ID';
  infoModal.querySelector('.classes-value').textContent = lastElementInfo.classes.length > 0 ? 
    lastElementInfo.classes.join(', ') : 'No classes';
  
  infoModal.querySelector('.dimensions-value').textContent = 
    `Width: ${lastElementInfo.dimensions.width}px, Height: ${lastElementInfo.dimensions.height}px`;
  
  infoModal.querySelector('.xpath-value').textContent = lastElementInfo.xpath || 'Not available';
  
  // Attributes
  const attributesHTML = Object.entries(lastElementInfo.attributes)
    .map(([name, value]) => `${name}="${value}"`)
    .join('\n');
  infoModal.querySelector('.attributes-value').textContent = attributesHTML || 'No attributes';
  
  // Styles
  const stylesHTML = Object.entries(lastElementInfo.styles)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');
  infoModal.querySelector('.style-value').textContent = stylesHTML || 'No computed styles';
}

// Element seçim modunu aç/kapat
function toggleSelectionMode() {
  isActive = !isActive;
  
  const selectButton = document.getElementById('analyzer-select-element');
  
  if (isActive) {
    selectButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
      </svg>
      Cancel
    `;
    selectButton.style.backgroundColor = "rgba(255, 255, 255, 0.75)";
    showNotification("Element selection mode active! Click on any element.");
  } else {
    selectButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 320 512" fill="currentColor">
        <path d="M0 55.2V426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320H297.9c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z"/>
      </svg>
      Select
    `;
    selectButton.style.backgroundColor = "rgba(255, 255, 255, 0.75)";
    resetPreviousElement();
  }
}

// Element üzerine gelindiğinde çalışacak fonksiyon
function handleMouseOver(event) {
  if (!isActive) return;
  
  // Event'in durmasını sağlar
  event.stopPropagation();
  
  // Önceki hover elementini eski haline getir
  resetPreviousElement();
  
  // Üzerine gelinen elementi güncelle
  hoveredElement = event.target;
  
  // Panel elemanlarına hover olduğunda işlemi engelle
  if (hoveredElement.closest('#html-analyzer-panel') || hoveredElement.closest('#analyzer-info-modal')) {
    hoveredElement = null;
    return;
  }
  
  // Önceki stil durumunu kaydet
  originalOutline = hoveredElement.style.outline;
  
  // Outline stilini uygula - Turuncu renk
  hoveredElement.style.outline = "2px solid #ff5722";
  hoveredElement.style.outlineOffset = "1px";
}

// Mouse elementten ayrıldığında çalışacak fonksiyon
function handleMouseOut(event) {
  if (!isActive || !hoveredElement) return;
  
  resetPreviousElement();
}

// Önceki hover elementini eski haline getirir
function resetPreviousElement() {
  if (hoveredElement) {
    hoveredElement.style.outline = originalOutline;
    hoveredElement.style.outlineOffset = "";
    hoveredElement = null;
  }
}

// Elemente tıklandığında bilgileri toplar ve kopyalar
function handleClick(event) {
  if (!isActive) return;
  
  // Event'in durmasını sağlar
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  
  // Panel elemanlarına tıklandığında işlemi engelle
  if (element.closest('#html-analyzer-panel') || element.closest('#analyzer-info-modal')) {
    return;
  }
  
  lastSelectedElement = element;
  
  // Element bilgilerini topla
  const elementInfo = getElementInfo(element);
  lastElementInfo = elementInfo;
  
  // Bilgileri JSON formatına çevir
  const jsonData = JSON.stringify(elementInfo, null, 2);
  
  // Panoya kopyala
  copyToClipboard(jsonData);
  
  // Seçilen öğeyi kaydet ve background script'e bildir
  chrome.storage.local.set({ lastElement: elementInfo });
  
  // Kullanıcıya bilgi ver
  showNotification("Element information copied to clipboard!");
  
  // Seçim modunu kapat
  toggleSelectionMode();
  
  // Modali güncelle (eğer açıksa)
  if (infoModalOpen) {
    updateInfoModal();
  }
}

// Element hakkında bilgileri toplar
function getElementInfo(element) {
  const computedStyle = window.getComputedStyle(element);
  
  // Tüm özellikleri topla
  const elementInfo = {
    tagName: element.tagName.toLowerCase(),
    id: element.id || null,
    classes: Array.from(element.classList) || [],
    attributes: getAttributes(element),
    text: element.textContent?.trim().substring(0, 100) || null,
    dimensions: {
      width: element.offsetWidth,
      height: element.offsetHeight
    },
    styles: {
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      fontSize: computedStyle.fontSize,
      display: computedStyle.display,
      position: computedStyle.position,
      margin: computedStyle.margin,
      padding: computedStyle.padding
    },
    xpath: getXPath(element)
  };
  
  return elementInfo;
}

// Element'in tüm özelliklerini getirir
function getAttributes(element) {
  const attributes = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attributes[attr.name] = attr.value;
  }
  return attributes;
}

// XPath oluşturur
function getXPath(element) {
  if (!element) return null;
  
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  if (element === document.body) {
    return '/html/body';
  }
  
  let ix = 0;
  const siblings = element.parentNode?.children || [];
  
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling === element) {
      let path = getXPath(element.parentNode);
      const tagName = element.tagName.toLowerCase();
      
      // XPath indeksi 1'den başlar
      return `${path}/${tagName}[${ix + 1}]`;
    }
    
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++;
    }
  }
  
  return null;
}

// Metni panoya kopyalar
function copyToClipboard(text) {
  // Try using navigator clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(err => {
      console.error("Copy error:", err);
    });
  } else {
    // Alternative method
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error("Copy error:", err);
    }
    
    document.body.removeChild(textArea);
  }
}

// Kopyalama bildirimi gösterir
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = 'html-analyzer-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.75);
    color: #000000;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 9999;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-size: 13px;
    font-weight: 500;
  `;
  
  document.body.appendChild(notification);
  
  // 2 saniye sonra bildirim kaybolur
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 2000);
}

// Modal için kopyalama butonlarını ayarla
function setupModalCopyButtons() {
  const modal = document.getElementById('analyzer-info-modal');
  if (!modal) return;
  
  const copyButtons = modal.querySelectorAll('.copy-item-button');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetClass = button.getAttribute('data-copy-target');
      const targetElement = modal.querySelector(`.${targetClass}`);
      
      if (targetElement && targetElement.textContent) {
        copyToClipboard(targetElement.textContent);
        showCopyButtonSuccess(button);
      }
    });
  });
}

// Kopyalama butonu için başarı animasyonu göster
function showCopyButtonSuccess(button) {
  const originalSvg = button.innerHTML;
  
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;
  button.style.color = '#27ae60';
  
  setTimeout(() => {
    button.innerHTML = originalSvg;
    button.style.color = '#666';
  }, 1500);
  
  showNotification("Copied to clipboard!");
}

// Event listener'ları ekle
document.addEventListener('mouseover', handleMouseOver, true);
document.addEventListener('mouseout', handleMouseOut, true);
document.addEventListener('click', handleClick, true);

// Sayfa yüklendiğinde paneli oluştur
document.addEventListener('DOMContentLoaded', () => {
  createSelectionPanel();
});

// Sayfa zaten yüklendiyse paneli oluştur
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(createSelectionPanel, 0);
}

// Extension'dan açma/kapama mesajı dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleActive') {
    isActive = request.value;
    
    // Panel butonunu güncelle
    const selectButton = document.getElementById('analyzer-select-element');
    if (selectButton) {
      if (isActive) {
        selectButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
          </svg>
          Cancel
        `;
        selectButton.style.backgroundColor = "rgba(255, 255, 255, 0.75)";
      } else {
        selectButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 320 512" fill="currentColor">
            <path d="M0 55.2V426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320H297.9c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z"/>
          </svg>
          Select
        `;
        selectButton.style.backgroundColor = "rgba(255, 255, 255, 0.75)";
        resetPreviousElement();
      }
    }
    
    sendResponse({ status: 'ok', isActive });
  } else if (request.action === 'getStatus') {
    sendResponse({ isActive });
  }
  return true;
});

// Sayfada extension'ın aktif olduğunu belirt
console.log('HTML Element Analyzer active');
