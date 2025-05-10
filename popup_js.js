// Popup Script - HTML Element Analyzer

// DOM element references
const elementInfo = document.getElementById('elementInfo');
const emptyState = document.getElementById('emptyState');
const copyButton = document.getElementById('copyButton');

// Element information fields
const tagName = document.getElementById('tagName');
const idValue = document.getElementById('idValue');
const idSection = document.getElementById('idSection');
const classValue = document.getElementById('classValue');
const classSection = document.getElementById('classSection');
const attributesList = document.getElementById('attributesList');
const attributesSection = document.getElementById('attributesSection');
const dimensionsValue = document.getElementById('dimensionsValue');
const xpathValue = document.getElementById('xpathValue');

// Last selected element JSON data
let lastElementJson = null;

// Function to run when popup is opened
document.addEventListener('DOMContentLoaded', () => {
  // Get extension status and last selected element
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (response && response.status === 'ok') {
      // Show last selected element
      if (response.lastElement) {
        displayElementInfo(response.lastElement);
      }
    }
  });
  
  // Copy button click event
  copyButton.addEventListener('click', () => {
    if (lastElementJson) {
      copyToClipboard(JSON.stringify(lastElementJson, null, 2));
      showCopyNotification(copyButton);
    }
  });
  
  // Setup individual copy buttons
  setupItemCopyButtons();
});

// Setup copy buttons for individual items
function setupItemCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-item-button');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-copy-target');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        let textToCopy = '';
        
        // Special handling for attributes list
        if (targetId === 'attributesList') {
          const attributeItems = {};
          const listItems = targetElement.querySelectorAll('li');
          
          listItems.forEach(item => {
            const text = item.textContent;
            const match = text.match(/([^:]+): "(.+)"/);
            if (match && match.length === 3) {
              attributeItems[match[1].trim()] = match[2];
            }
          });
          
          textToCopy = JSON.stringify(attributeItems, null, 2);
        } else {
          textToCopy = targetElement.textContent;
        }
        
        if (textToCopy) {
          copyToClipboard(textToCopy);
          showItemCopyNotification(button);
        }
      }
    });
  });
}

// Display element information
function displayElementInfo(elementData) {
  // Store JSON data
  lastElementJson = elementData;
  
  // Hide empty state, show element info
  emptyState.style.display = 'none';
  elementInfo.style.display = 'block';
  
  // Update basic information
  tagName.textContent = elementData.tagName || '';
  
  // Update ID information
  if (elementData.id) {
    idValue.textContent = elementData.id;
    idSection.style.display = 'block';
  } else {
    idSection.style.display = 'none';
  }
  
  // Update class information
  if (elementData.classes && elementData.classes.length > 0) {
    classValue.textContent = elementData.classes.join(' ');
    classSection.style.display = 'block';
  } else {
    classSection.style.display = 'none';
  }
  
  // Update attributes information
  if (elementData.attributes && Object.keys(elementData.attributes).length > 0) {
    // Clear attribute list
    attributesList.innerHTML = '';
    
    // Add each attribute to the list
    Object.entries(elementData.attributes).forEach(([name, value]) => {
      if (name !== 'id' && name !== 'class') {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span class="attribute">${name}</span>: "${value}"`;
        attributesList.appendChild(listItem);
      }
    });
    
    attributesSection.style.display = 'block';
  } else {
    attributesSection.style.display = 'none';
  }
  
  // Update dimension information
  if (elementData.dimensions) {
    dimensionsValue.textContent = `Width: ${elementData.dimensions.width}px, Height: ${elementData.dimensions.height}px`;
  }
  
  // Update XPath information
  if (elementData.xpath) {
    xpathValue.textContent = elementData.xpath;
  }
}

// Copy text to clipboard
function copyToClipboard(text) {
  // Try using navigator clipboard API
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(err => {
      console.error("Copy error:", err);
      // Use fallback method
      fallbackCopy(text);
    });
  } else {
    // Use fallback method
    fallbackCopy(text);
  }
}

// Alternative copy method
function fallbackCopy(text) {
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

// Show copy notification for main button
function showCopyNotification(button) {
  const originalText = button.innerHTML;
  
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Copied!
  `;
  button.style.backgroundColor = "#333333";
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.backgroundColor = "#000000";
  }, 1500);
}

// Show copy notification for individual item buttons
function showItemCopyNotification(button) {
  const originalSvg = button.innerHTML;
  
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;
  button.style.color = "#27ae60";
  
  setTimeout(() => {
    button.innerHTML = originalSvg;
    button.style.color = "#666";
  }, 1500);
}
