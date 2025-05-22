// Store for the current editing prompt if any
let currentEditingId = null;
const defaultPrompts = [
  {
    id: '1',
    title: '礼貌问候',
    content: '您好，希望这条消息能够顺利送达。'
  },
  {
    id: '2',
    title: '会议请求',
    content: '我想安排一次会议进一步讨论这个问题。请告知您的可用时间。'
  },
  {
    id: '3',
    title: '感谢信',
    content: '感谢您的帮助。我非常感谢您在这件事上给予的支持。'
  }
];

// DOM Elements
const promptListElement = document.getElementById('promptList');
const promptTitleInput = document.getElementById('promptTitle');
const promptContentInput = document.getElementById('promptContent');
const savePromptButton = document.getElementById('savePrompt');
const cancelEditButton = document.getElementById('cancelEdit');
const jsonFileInput = document.getElementById('jsonFileInput');
const importButton = document.getElementById('importButton');
const exportButton = document.getElementById('exportButton');
const syncButton = document.getElementById('syncButton');
const importMessage = document.getElementById('importMessage');
const urlModal = document.getElementById('urlModal');
const jsonUrlInput = document.getElementById('jsonUrl');
const loadUrlButton = document.getElementById('loadUrlButton');
const cancelUrlButton = document.getElementById('cancelUrlButton');

// Initialize prompts when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadPrompts();
  
  // Add icons to bottom buttons
  initButtonIcons();
  
  // Event listeners
  savePromptButton.addEventListener('click', savePrompt);
  cancelEditButton.addEventListener('click', cancelEdit);
  
  // Updated import functionality
  // Clicking on import button opens the file dialog
  importButton.addEventListener('click', () => {
    jsonFileInput.click();
  });
  
  // When a file is selected, automatically import it
  jsonFileInput.addEventListener('change', (event) => {
    if (event.target.files.length > 0) {
      importFromJson(event.target.files[0]);
    }
  });
  
  // Sync functionality - Show URL input modal
  syncButton.addEventListener('click', () => {
    urlModal.style.display = 'block';
    jsonUrlInput.focus();
    
    // 默认填充GitHub URL
    if (!jsonUrlInput.value) {
      jsonUrlInput.value = 'https://raw.githubusercontent.com/x2x5/Common-Prompts-Edge/main/sample_prompts.json';
    }
  });
  
  // URL modal buttons
  loadUrlButton.addEventListener('click', () => {
    let url = jsonUrlInput.value.trim();
    if (url) {
      // 自动转换GitHub URL为raw URL
      const originalUrl = url;
      url = convertToRawGitHubUrl(url);
      
      // 如果URL被转换，显示通知
      if (url !== originalUrl) {
        // 保存转换后的URL到输入框，方便用户查看
        jsonUrlInput.value = url;
        
        // 显示已转换通知
        alert(`URL已被自动转换为正确的raw格式:\n${url}`);
      }
      
      syncFromUrl(url);
      urlModal.style.display = 'none';
    } else {
      alert('请输入有效的URL');
    }
  });
  
  // 支持在URL输入框中按回车键
  jsonUrlInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      loadUrlButton.click();
    }
  });
  
  cancelUrlButton.addEventListener('click', () => {
    urlModal.style.display = 'none';
  });
  
  // Export functionality
  exportButton.addEventListener('click', exportToJson);
});

// Initialize button icons
function initButtonIcons() {
  // Add plus icon to save/add button
  savePromptButton.appendChild(createSVGIcon('add'));
  
  // Add brush icon to cancel/clear button
  cancelEditButton.appendChild(createSVGIcon('clear'));
  
  // Add sync icon
  syncButton.appendChild(createSVGIcon('sync'));
  
  // Add import icon
  importButton.appendChild(createSVGIcon('import'));
  
  // Add export icon
  exportButton.appendChild(createSVGIcon('export'));
}

// Load prompts from storage
function loadPrompts() {
  chrome.storage.sync.get('prompts', (result) => {
    let prompts = result.prompts;
    
    // If no prompts in storage, use default prompts
    if (!prompts || prompts.length === 0) {
      prompts = defaultPrompts;
      chrome.storage.sync.set({ prompts: defaultPrompts });
    }
    
    displayPrompts(prompts);
  });
}

// Create SVG icon elements
function createSVGIcon(type) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  
  const path = document.createElementNS(svgNS, "path");
  
  switch(type) {
    case 'copy':
      path.setAttribute("d", "M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z");
      break;
    case 'delete':
      path.setAttribute("d", "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z");
      break;
    case 'add':
      path.setAttribute("d", "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z");
      break;
    case 'save':
      path.setAttribute("d", "M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z");
      break;
    case 'clear':
      path.setAttribute("d", "M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 01-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0zM4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-4.95-4.95-4.95 4.95z");
      break;
    case 'import':
      path.setAttribute("d", "M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z");
      break;
    case 'export':
      path.setAttribute("d", "M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z");
      break;
    case 'sync':
      path.setAttribute("d", "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z");
      break;
    case 'edit':
      path.setAttribute("d", "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z");
      break;
  }
  
  svg.appendChild(path);
  return svg;
}

// Display prompts in the list
function displayPrompts(prompts) {
  promptListElement.innerHTML = '';
  
  prompts.forEach(prompt => {
    const promptItem = document.createElement('div');
    promptItem.className = 'prompt-item';
    
    const promptTitle = document.createElement('div');
    promptTitle.className = 'prompt-title';
    promptTitle.textContent = prompt.title;
    promptTitle.title = `${prompt.title} (点击复制内容)`; // Add tooltip for long titles and copy hint
    
    // Make the entire title clickable for copying
    promptTitle.addEventListener('click', () => {
      copyToClipboard(prompt.content);
      
      // Visual feedback for copy
      const originalColor = promptTitle.style.color;
      promptTitle.style.color = '#5cb85c';
      
      setTimeout(() => {
        promptTitle.style.color = originalColor;
      }, 1000);
    });
    
    const promptActions = document.createElement('div');
    promptActions.className = 'prompt-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-copy';
    editButton.title = '编辑';
    
    // Add edit icon
    editButton.appendChild(createSVGIcon('edit'));
    
    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      editPrompt(prompt);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.title = '删除';
    
    // Add delete icon
    deleteButton.appendChild(createSVGIcon('delete'));
    
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePrompt(prompt.id);
    });
    
    promptActions.appendChild(editButton);
    promptActions.appendChild(deleteButton);
    
    promptItem.appendChild(promptTitle);
    promptItem.appendChild(promptActions);
    
    promptListElement.appendChild(promptItem);
  });
}

// Export prompts to JSON file
function exportToJson() {
  chrome.storage.sync.get('prompts', (result) => {
    const prompts = result.prompts || [];
    const jsonString = JSON.stringify(prompts, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts.json';
    a.click();

    URL.revokeObjectURL(url); // Clean up the URL object
  });
}

// Import prompts from JSON file
function importFromJson(file) {
  if (!file) {
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      
      // Check if the JSON is valid for import
      if (!Array.isArray(jsonData) && !isValidPromptObject(jsonData)) {
        alert('无效的JSON格式。请确保JSON包含title和content字段，或者是这样的数组。');
        return;
      }
      
      // Process the JSON data based on its format
      let newPrompts = [];
      
      if (Array.isArray(jsonData)) {
        // Array of prompt objects
        newPrompts = jsonData.filter(item => isValidPromptItem(item))
          .map(item => {
            return {
              id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
              title: item.title,
              content: item.content
            };
          });
      } else {
        // Single object with title-content pairs
        newPrompts = Object.entries(jsonData).map(([title, content]) => {
          return {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title,
            content
          };
        });
      }
      
      if (newPrompts.length === 0) {
        alert('未找到有效的提示词');
        return;
      }
      
      // Add the new prompts to existing ones
      chrome.storage.sync.get('prompts', (result) => {
        let prompts = result.prompts || [];
        prompts = [...prompts, ...newPrompts];
        
        chrome.storage.sync.set({ prompts }, () => {
          displayPrompts(prompts);
          
          // Show success message
          importMessage.style.display = 'block';
          setTimeout(() => {
            importMessage.style.display = 'none';
          }, 3000);
          
          // Clear the file input
          jsonFileInput.value = '';
        });
      });
      
    } catch (error) {
      alert('解析JSON文件时出错: ' + error.message);
    }
  };
  
  reader.onerror = function() {
    alert('读取文件时出错');
  };
  
  reader.readAsText(file);
}

// Check if an object is a valid prompt item
function isValidPromptItem(item) {
  return item && typeof item === 'object' && 
         item.title && typeof item.title === 'string' && 
         item.content && typeof item.content === 'string';
}

// Check if an object is a valid prompt object (title-content pairs)
function isValidPromptObject(obj) {
  return obj && typeof obj === 'object' && 
         Object.entries(obj).length > 0 && 
         Object.entries(obj).every(([key, value]) => 
           typeof key === 'string' && typeof value === 'string');
}

// Insert prompt into active tab
function insertPrompt(content) {
  // Try to insert into active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'insertPrompt', content: content },
      (response) => {
        // If insertion failed or no response, copy to clipboard instead
        if (!response || !response.success) {
          copyToClipboard(content);
        }
      }
    );
  });
}

// Copy content to clipboard
function copyToClipboard(content, button = null) {
  navigator.clipboard.writeText(content)
    .then(() => {
      if (button) {
        // For icon button, we'll change the background color briefly
        const originalBackground = button.style.backgroundColor;
        button.style.backgroundColor = '#3a9d3a';
        button.disabled = true;
        
        // Reset button after 1.5 seconds
        setTimeout(() => {
          button.style.backgroundColor = originalBackground;
          button.disabled = false;
        }, 1500);
      }
    })
    .catch(err => {
      console.error('复制失败: ', err);
    });
}

// Start editing a prompt
function editPrompt(prompt) {
  currentEditingId = prompt.id;
  promptTitleInput.value = prompt.title;
  promptContentInput.value = prompt.content;
  
  // Change add button to save button icon
  savePromptButton.innerHTML = '';
  savePromptButton.appendChild(createSVGIcon('save'));
  savePromptButton.title = '保存';
}

// Save new or edited prompt
function savePrompt() {
  const title = promptTitleInput.value.trim();
  const content = promptContentInput.value.trim();
  
  if (!title || !content) {
    alert('请输入标题和内容');
    return;
  }
  
  chrome.storage.sync.get('prompts', (result) => {
    let prompts = result.prompts || defaultPrompts;
    
    if (currentEditingId) {
      // Update existing prompt
      const index = prompts.findIndex(p => p.id === currentEditingId);
      if (index !== -1) {
        prompts[index] = { id: currentEditingId, title, content };
      }
    } else {
      // Add new prompt
      const newId = Date.now().toString();
      prompts.push({ id: newId, title, content });
    }
    
    chrome.storage.sync.set({ prompts: prompts }, () => {
      displayPrompts(prompts);
      cancelEdit();
    });
  });
}

// Cancel editing
function cancelEdit() {
  currentEditingId = null;
  promptTitleInput.value = '';
  promptContentInput.value = '';
  
  // Reset to add button icon
  savePromptButton.innerHTML = '';
  savePromptButton.appendChild(createSVGIcon('add'));
  savePromptButton.title = '新增';
}

// Delete a prompt
function deletePrompt(id) {
  chrome.storage.sync.get('prompts', (result) => {
    let prompts = result.prompts || [];
    const newPrompts = prompts.filter(prompt => prompt.id !== id);
    
    chrome.storage.sync.set({ prompts: newPrompts }, () => {
      displayPrompts(newPrompts);
      
      // If currently editing this prompt, cancel edit
      if (currentEditingId === id) {
        cancelEdit();
      }
    });
  });
}

// Sync prompts from URL
function syncFromUrl(url) {
  // Show a loading indicator on the button
  const originalIcon = syncButton.innerHTML;
  syncButton.disabled = true;
  syncButton.innerHTML = '';
  
  // Create a loading icon (simple spinning animation)
  const loadingIcon = document.createElement('div');
  loadingIcon.style.width = '18px';
  loadingIcon.style.height = '18px';
  loadingIcon.style.border = '2px solid #f3f3f3';
  loadingIcon.style.borderTop = '2px solid #ffffff';
  loadingIcon.style.borderRadius = '50%';
  loadingIcon.style.animation = 'spin 1s linear infinite';
  
  // Add CSS animation
  if (!document.getElementById('spinAnimation')) {
    const style = document.createElement('style');
    style.id = 'spinAnimation';
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
  
  syncButton.appendChild(loadingIcon);
  
  // Fetch the JSON data from the provided URL
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data) && !isValidPromptObject(data)) {
        throw new Error('无效的数据格式！');
      }
      
      // Process the fetched data
      let newPrompts = [];
      
      if (Array.isArray(data)) {
        // Array of prompt objects
        newPrompts = data.filter(item => isValidPromptItem(item))
          .map(item => {
            return {
              id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
              title: item.title,
              content: item.content
            };
          });
      } else {
        // Single object with title-content pairs
        newPrompts = Object.entries(data).map(([title, content]) => {
          return {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title,
            content
          };
        });
      }
      
      if (newPrompts.length === 0) {
        throw new Error('未在同步的数据中找到有效的提示词。');
      }
      
      // Replace the existing prompts with the synced ones
      chrome.storage.sync.set({ prompts: newPrompts }, () => {
        displayPrompts(newPrompts);
        
        // Show success message
        importMessage.textContent = '同步成功！';
        importMessage.style.display = 'block';
        setTimeout(() => {
          importMessage.style.display = 'none';
          importMessage.textContent = '导入成功！'; // Restore default message text
        }, 3000);
      });
    })
    .catch(error => {
      console.error('同步错误:', error);
      alert(`同步失败: ${error.message}`);
    })
    .finally(() => {
      // Restore the original button state
      syncButton.innerHTML = '';
      syncButton.appendChild(createSVGIcon('sync'));
      syncButton.disabled = false;
    });
}

// 将GitHub URL转换为raw URL
function convertToRawGitHubUrl(url) {
  // 保存原始URL以便检测是否发生变化
  const originalUrl = url;

  // 检查是否已经是raw URL
  if (url.includes('raw.githubusercontent.com')) {
    return url;
  }
  
  // 处理 @格式 (如 @https://github.com/...)
  if (url.startsWith('@')) {
    return convertToRawGitHubUrl(url.substring(1));
  }
  
  // 转换 github.com/user/repo/blob/branch/path 格式
  // 为 raw.githubusercontent.com/user/repo/branch/path
  let rawUrl = url;
  
  // 匹配 github.com URL
  const githubRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/(?:blob|tree)\/([^\/]+)\/(.+)$/;
  const match = url.match(githubRegex);
  
  if (match) {
    const [_, user, repo, branch, path] = match;
    rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
  }
  
  // 处理 refs/heads/ 格式
  // 如果URL包含 refs/heads/ 保持不变
  // 否则其他的 blob/ 或 tree/ 需要替换
  if (!rawUrl.includes('/refs/heads/')) {
    rawUrl = rawUrl.replace('/blob/', '/').replace('/tree/', '/');
  }
  
  // 特殊检查 refs/heads/main 格式
  if (url.includes('/refs/heads/main/')) {
    const refsPattern = /^https?:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/refs\/heads\/main\/(.+)$/;
    const refsMatch = rawUrl.match(refsPattern);
    
    if (refsMatch) {
      const [_, user, repo, path] = refsMatch;
      rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/${path}`;
    }
  }
  
  // 如果URL被转换了，显示一个短暂的通知
  if (rawUrl !== originalUrl) {
    console.log(`URL已转换: ${originalUrl} -> ${rawUrl}`);
  }
  
  return rawUrl;
} 