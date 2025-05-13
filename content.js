// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'insertPrompt') {
    const success = insertIntoActiveElement(request.content);
    sendResponse({ success });
  }
  return true; // Keep the message channel open for the async response
});

// Try to insert text into the currently focused element
function insertIntoActiveElement(text) {
  // Get the active element
  const activeElement = document.activeElement;
  
  // Check if the active element is an input, textarea, or contenteditable element
  if (isEditableElement(activeElement)) {
    // Insert text based on the element type
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      // For input and textarea elements
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const beforeText = activeElement.value.substring(0, start);
      const afterText = activeElement.value.substring(end);
      
      activeElement.value = beforeText + text + afterText;
      
      // Move cursor to the end of inserted text
      const newPosition = start + text.length;
      activeElement.setSelectionRange(newPosition, newPosition);
      
      // Trigger input event to notify the page of changes
      const event = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(event);
      
      return true;
    } else if (activeElement.isContentEditable) {
      // For contenteditable elements (like rich text editors)
      // This approach works for simple contenteditable divs
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Move cursor to the end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        activeElement.dispatchEvent(event);
        
        return true;
      }
    }
  }
  
  // If no suitable element is focused, try to find the first visible input or textarea
  const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea');
  for (const input of inputs) {
    if (isElementVisible(input)) {
      input.focus();
      input.value = text;
      
      // Trigger input event
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      
      return true;
    }
  }
  
  // If we couldn't find any suitable element, return false
  return false;
}

// Check if an element is an editable element
function isEditableElement(element) {
  if (!element) return false;
  
  // Check for input elements that accept text
  if (element.tagName === 'INPUT') {
    const type = element.type.toLowerCase();
    return type === 'text' || type === 'search' || type === 'email' || 
           type === 'password' || type === 'tel' || type === 'url' || 
           type === 'number' || type === '';
  }
  
  // Check for textarea elements
  if (element.tagName === 'TEXTAREA') {
    return true;
  }
  
  // Check for contenteditable elements
  if (element.isContentEditable) {
    return true;
  }
  
  return false;
}

// Check if an element is visible
function isElementVisible(element) {
  if (!element) return false;
  
  // Check if element or any parent has display: none or visibility: hidden
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  // Check if element has zero dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }
  
  // Check if element is within viewport
  if (
    rect.bottom < 0 ||
    rect.top > window.innerHeight ||
    rect.right < 0 ||
    rect.left > window.innerWidth
  ) {
    return false;
  }
  
  return true;
} 