const themeLink = document.getElementById('theme-link');
const codeInput = document.getElementById('codeInput');
const codeBox = document.getElementById('codeBox');

const MAX_WIDTH = 800;
const MIN_WIDTH = 400;
const PADDING = 40;

if (codeInput) {
    codeInput.style.whiteSpace = 'pre-wrap';
    codeInput.style.wordWrap = 'break-word';
    codeInput.style.width = 'auto';
    codeInput.style.minWidth = `${MIN_WIDTH}px`;
    codeInput.style.maxWidth = `${MAX_WIDTH}px`;
    codeInput.style.overflowX = 'hidden';
    codeInput.style.overflowY = 'auto';
    codeInput.style.resize = 'none';
    codeInput.style.height = 'auto';
    codeInput.style.display = 'inline-block';
}

const container = document.querySelector('.container');
if (container) {
    container.style.width = '100%';
    container.style.minWidth = `${MIN_WIDTH}px`;
    container.style.maxWidth = `${MAX_WIDTH}px`;
}

const settings = document.querySelector('.settings');
if (settings) {
    settings.style.width = '100%';
    settings.style.flexWrap = 'wrap';
    settings.style.gap = '10px';
}

const title = document.querySelector('.title');
if (title) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            title.style.display = 'none';
        } else {
            title.style.display = 'block';
        }
    });
}

function getCaretCharacterOffsetWithin(element) {
    let caretOffset = 0;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
}

function setCaretPosition(element, position) {
    let charCount = 0;
    let node;
    
    const walk = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    while ((node = walk.nextNode())) {
        const nodeLength = node.textContent.length;
        if (charCount + nodeLength >= position) {
            const range = document.createRange();
            const selection = window.getSelection();
            
            range.setStart(node, position - charCount);
            range.collapse(true);
            
            selection.removeAllRanges();
            selection.addRange(range);
            
            const rect = range.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            if (rect.top < elementRect.top) {
                element.scrollTop -= (elementRect.top - rect.top);
            } else if (rect.bottom > elementRect.bottom) {
                element.scrollTop += (rect.bottom - elementRect.bottom);
            }
            
            return;
        }
        charCount += nodeLength;
    }
}

function formatCode() {
    const code = codeInput.innerText;
    const cursorPosition = getCaretCharacterOffsetWithin(codeInput);
    const selectedLanguage = document.getElementById('languageSelect').value;
    const result = selectedLanguage === 'auto' 
        ? hljs.highlightAuto(code) 
        : hljs.highlight(code, { language: selectedLanguage });
    codeInput.innerHTML = result.value;
    setCaretPosition(codeInput, cursorPosition);
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode('\n');
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        const currentOffset = getCaretCharacterOffsetWithin(codeInput);
        formatCode();
        setCaretPosition(codeInput, currentOffset);
    }
}

function changeTheme() {
    const selectedTheme = document.getElementById('themeSelect').value;
    const customThemeInput = document.getElementById('customThemeInput');

    if (selectedTheme === 'custom') {
        customThemeInput.style.display = 'inline-block';
        const customThemeURL = customThemeInput.value;
        if (customThemeURL) {
            validateAndApplyCustomTheme(customThemeURL);
        }
    } else {
        customThemeInput.style.display = 'none';
        themeLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${selectedTheme}.min.css`;
    }
}

function validateAndApplyCustomTheme(url) {
    fetch(url, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                themeLink.href = url;
            } else {
                alert('Invalid URL. Please enter a valid CSS file URL.');
            }
        })
        .catch(() => {
            alert('Invalid URL. Please enter a valid CSS file URL.');
        });
}

function changeBackgroundColor() {
    const bgColor = document.getElementById('bgColorInput').value;
    codeBox.style.backgroundColor = bgColor;
}

function cropCanvas(canvas, cropSize) {
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');
    croppedCanvas.width = canvas.width - cropSize * 2;
    croppedCanvas.height = canvas.height - cropSize * 2;
    ctx.drawImage(canvas, cropSize, cropSize, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);
    return croppedCanvas;
}

function exportToImage() {
    const originalBorder = codeBox.style.border;
    const originalBackgroundColor = codeBox.style.backgroundColor;
    codeBox.style.border = 'none';
    codeBox.style.backgroundColor = 'transparent';

    html2canvas(codeBox, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        timeout: 10000,
        onclone: (clonedDoc) => {
            clonedDoc.getElementById('codeBox').style.borderRadius = '6px';
            clonedDoc.getElementById('codeBox').style.backgroundColor = originalBackgroundColor;
        }
    }).then(canvas => {
        const croppedCanvas = cropCanvas(canvas, 4);
        const link = document.createElement('a');
        link.download = 'code.png';
        link.href = croppedCanvas.toDataURL('image/png');
        link.click();

        codeBox.style.border = originalBorder;
        codeBox.style.backgroundColor = originalBackgroundColor;
    }).catch(error => {
        console.error('Failed to generate the image:', error);
        shopwAnimation('Failed to generate the image. Please try again.');
        codeBox.style.border = originalBorder;
        codeBox.style.backgroundColor = originalBackgroundColor;
    });
}

function copyToClipboard() {
    const originalBorder = codeBox.style.border;
    const originalBackgroundColor = codeBox.style.backgroundColor;
    codeBox.style.border = 'none';
    codeBox.style.backgroundColor = 'transparent';

    html2canvas(codeBox, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        timeout: 10000,
        onclone: (clonedDoc) => {
            clonedDoc.getElementById('codeBox').style.borderRadius = '6px';
            clonedDoc.getElementById('codeBox').style.backgroundColor = originalBackgroundColor;
        }
    }).then(canvas => {
        const croppedCanvas = cropCanvas(canvas, 4);
        croppedCanvas.toBlob(blob => {
            if (!blob) {
                console.error('Failed to generate the image blob.');
                shopwAnimation('Failed to generate the image. Please try again.');
                codeBox.style.border = originalBorder;
                codeBox.style.backgroundColor = originalBackgroundColor;
                return;
            }

            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                shopwAnimation("Copied!");
            }).catch(err => {
                console.error('Failed to copy image to clipboard:', err);
            });

            codeBox.style.border = originalBorder;
            codeBox.style.backgroundColor = originalBackgroundColor;
        });
    }).catch(error => {
        console.error('Failed to generate the image:', error);
        shopwAnimation('Failed to generate the image. Please try again.');
        codeBox.style.border = originalBorder;
        codeBox.style.backgroundColor = originalBackgroundColor;
    });
}

function shopwAnimation(text) {
    const overlay = document.createElement('div');
    overlay.innerText = text;
    overlay.style.position = 'fixed';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.padding = '20px 40px';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.color = '#fff';
    overlay.style.fontSize = '1.5rem';
    overlay.style.borderRadius = '10px';
    overlay.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translate(-50%, -55%)';
    });

    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.addEventListener('transitionend', () => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
    }, 1500);
}

const dropArea = document.getElementById('dropArea');

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.py') || file.name.endsWith('.c') || file.name.endsWith('.cpp') || file.name.endsWith('.js') || file.name.endsWith('.java') || file.name.endsWith('.html') || file.name.endsWith('.css'))) {
        const reader = new FileReader();
        reader.onload = (e) => {
            codeInput.innerText = e.target.result;
            formatCode();
        };
        reader.readAsText(file);
    } else {
        alert('Please drop a valid code file.');
    }
});

dropArea.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.py,.c,.cpp,.js,.java,.html,.css';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                codeInput.innerText = e.target.result;
                formatCode();
            };
            reader.readAsText(file);
        }
    };
    fileInput.click();
});

document.getElementById('themeSelect').addEventListener('change', changeTheme);
document.getElementById('languageSelect').addEventListener('change', formatCode);
document.getElementById('bgColorInput').addEventListener('input', changeBackgroundColor);
document.getElementById('exportButton').addEventListener('click', exportToImage);
document.getElementById('copyButton').addEventListener('click', copyToClipboard);
document.getElementById('customThemeInput').addEventListener('input', () => {
    const customThemeURL = document.getElementById('customThemeInput').value;
    validateAndApplyCustomTheme(customThemeURL);
});
codeInput.addEventListener('input', formatCode);
codeInput.addEventListener('keydown', handleEnterKey);

codeInput.addEventListener('focus', () => {
    codeInput.style.outline = 'none';
});

codeInput.addEventListener('blur', () => {
    codeInput.style.outline = '';
});

document.getElementById('modeSwitch').addEventListener('change', (event) => {
    if (event.target.checked) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
    updateSnowflakes();
});

document.getElementById('toggleDotsButton').addEventListener('click', () => {
    const codeBoxHeader = document.getElementById('codeBoxHeader');
    const codeBox = document.getElementById('codeBox');
    if (codeBoxHeader.style.display === 'none') {
        codeBoxHeader.style.display = 'flex';
        codeBox.classList.remove('no-dots');
    } else {
        codeBoxHeader.style.display = 'none';
        codeBox.classList.add('no-dots');
    }
});

formatCode();