/**
 * 生成注入 iframe 的元素选择器脚本字符串。
 *
 * 交互行为：
 * - hover：蓝色 outline 高亮
 * - click：红色 outline 选中 + 弹出 prompt 浮层
 * - 提交：postMessage({ type: 'D2C_COMMENT', ... }) 到父窗口
 *
 * 不依赖 data-corehash，可在任意 React 渲染结果上使用。
 */
export const buildElementSelectorScript = (): string => `
(function () {
  var PARENT_ORIGIN = '*';
  var selectedElement = null;
  var hoveredElement = null;
  var selectEnabled = false;
  var savedOutlines = new WeakMap();
  var currentCloseOnOutside = null;
  var rafPending = false;

  function isInPromptLayer(el) {
    var cur = el;
    while (cur) {
      if (cur.classList && cur.classList.contains('__d2c_prompt_layer__')) return true;
      cur = cur.parentElement;
    }
    return false;
  }

  function saveOutline(el) {
    if (!savedOutlines.has(el)) {
      savedOutlines.set(el, {
        outline: el.style.outline,
        outlineOffset: el.style.outlineOffset,
        transition: el.style.transition,
        cursor: el.style.cursor
      });
    }
  }

  function restoreOutline(el) {
    var saved = savedOutlines.get(el);
    if (saved) {
      el.style.outline = saved.outline;
      el.style.outlineOffset = saved.outlineOffset;
      el.style.transition = saved.transition;
      el.style.cursor = saved.cursor;
      savedOutlines.delete(el);
    }
  }

  function clearSelection() {
    if (selectedElement) {
      restoreOutline(selectedElement);
      selectedElement = null;
    }
  }

  function setSelection(el) {
    clearSelection();
    selectedElement = el;
    if (el) {
      saveOutline(el);
      el.style.outline = '2px solid #ef4444';
      el.style.outlineOffset = '2px';
      el.style.transition = 'outline 0.1s ease';
      el.style.cursor = 'pointer';
    }
  }

  function safeRemove(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function removeCloseOnOutside() {
    if (currentCloseOnOutside) {
      document.removeEventListener('click', currentCloseOnOutside, true);
      currentCloseOnOutside = null;
    }
  }

  function dismissPromptLayer() {
    var existing = document.querySelector('.__d2c_prompt_layer__');
    if (existing) safeRemove(existing);
    removeCloseOnOutside();
  }

  function clampToViewport(layer, refEl) {
    var rect = layer.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      layer.style.left = Math.max(4, window.innerWidth - rect.width - 8) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      var refTop = refEl.getBoundingClientRect().top;
      var newTop = refTop + window.scrollY - rect.height - 8;
      layer.style.top = Math.max(window.scrollY + 4, newTop) + 'px';
    }
  }

  function describeElement(el) {
    var tag = (el.tagName || '').toLowerCase();
    var cls = el.className && typeof el.className === 'string'
      ? el.className.split(/\\s+/).filter(function (c) { return c && !c.startsWith('__'); }).join(' ')
      : '';
    var text = (el.textContent || '').trim();
    if (text.length > 80) text = text.substring(0, 80) + '...';
    var rect = el.getBoundingClientRect();
    return {
      tagName: tag,
      className: cls,
      textContent: text,
      rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }
    };
  }

  function createPromptLayer(target) {
    dismissPromptLayer();

    var layer = document.createElement('div');
    layer.className = '__d2c_prompt_layer__';

    var rect = target.getBoundingClientRect();
    var vw = window.innerWidth || document.documentElement.clientWidth || 0;
    var isMobile = vw > 0 && vw <= 480;

    Object.assign(layer.style, {
      position: 'absolute',
      top: (rect.bottom + window.scrollY + (isMobile ? 6 : 10)) + 'px',
      left: (rect.left + window.scrollX) + 'px',
      backgroundColor: '#ffffff',
      border: '1px solid rgba(59,130,246,0.3)',
      padding: isMobile ? '10px' : '14px',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      zIndex: '10000',
      width: isMobile ? Math.max(240, vw - 24) + 'px' : '360px',
      fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif"
    });

    var info = describeElement(target);

    var badge = document.createElement('div');
    badge.style.cssText = 'margin-bottom:8px;padding:4px 8px;background:#f0f7ff;color:#2563eb;border-radius:4px;font-size:12px;font-family:monospace;word-break:break-all;';
    badge.textContent = '<' + info.tagName + (info.className ? ' class="' + info.className + '"' : '') + '>';
    layer.appendChild(badge);

    if (info.textContent) {
      var preview = document.createElement('div');
      preview.style.cssText = 'margin-bottom:8px;padding:4px 8px;background:#fafafa;color:#666;border-radius:4px;font-size:12px;max-height:48px;overflow:hidden;';
      preview.textContent = info.textContent;
      layer.appendChild(preview);
    }

    var textarea = document.createElement('textarea');
    textarea.placeholder = "输入修改意见，例如：'按钮改为蓝色、文字居中'";
    Object.assign(textarea.style, {
      width: '100%',
      minHeight: '72px',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      resize: 'vertical',
      fontFamily: 'inherit',
      fontSize: '13px',
      boxSizing: 'border-box',
      outline: 'none'
    });
    textarea.addEventListener('focus', function () { textarea.style.borderColor = '#3b82f6'; });
    textarea.addEventListener('blur', function () { textarea.style.borderColor = '#d1d5db'; });
    layer.appendChild(textarea);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:8px;';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = 'padding:5px 14px;border:1px solid #d1d5db;background:#fff;color:#374151;border-radius:6px;cursor:pointer;font-size:13px;';
    cancelBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      dismissPromptLayer();
      clearSelection();
    });

    var submitBtn = document.createElement('button');
    submitBtn.textContent = '发送到会话';
    submitBtn.style.cssText = 'padding:5px 14px;border:none;background:#3b82f6;color:#fff;border-radius:6px;cursor:pointer;font-size:13px;';
    submitBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var comment = textarea.value.trim();
      if (!comment) return;
      window.parent.postMessage({
        type: 'D2C_COMMENT',
        elementInfo: info,
        comment: comment
      }, PARENT_ORIGIN);
      dismissPromptLayer();
      clearSelection();
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(submitBtn);
    layer.appendChild(btnRow);

    currentCloseOnOutside = function closeOnOutside(ev) {
      if (!layer.contains(ev.target) && ev.target !== target) {
        dismissPromptLayer();
        clearSelection();
      }
    };
    document.addEventListener('click', currentCloseOnOutside, true);

    document.body.appendChild(layer);
    setTimeout(function () { textarea.focus(); }, 80);
    clampToViewport(layer, target);
  }

  function findMeaningfulElement(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    var dominated = ['SPAN', 'EM', 'STRONG', 'B', 'I', 'U', 'BR', 'WBR', 'SUB', 'SUP'];
    var cur = el;
    while (cur && cur !== document.body) {
      if (dominated.indexOf(cur.tagName) === -1) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  document.addEventListener('mousemove', function (e) {
    if (!selectEnabled || rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || isInPromptLayer(el)) {
        if (hoveredElement && hoveredElement !== selectedElement) restoreOutline(hoveredElement);
        hoveredElement = null;
        return;
      }
      if (hoveredElement && hoveredElement !== selectedElement) restoreOutline(hoveredElement);
      var meaningful = findMeaningfulElement(el);
      hoveredElement = meaningful;
      if (hoveredElement && hoveredElement !== selectedElement) {
        saveOutline(hoveredElement);
        hoveredElement.style.outline = '2px solid #3b82f6';
        hoveredElement.style.outlineOffset = '1px';
      }
    });
  }, true);

  document.addEventListener('click', function (e) {
    if (!selectEnabled) return;
    var el = e.target;
    if (!el || isInPromptLayer(el)) return;
    e.preventDefault();
    e.stopPropagation();
    var meaningful = findMeaningfulElement(el);
    if (!meaningful) return;
    setSelection(meaningful);
    createPromptLayer(meaningful);
  }, true);

  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'D2C_TOGGLE_SELECT') {
      var next = !!e.data.enable;
      if (selectEnabled && !next) {
        if (hoveredElement) { restoreOutline(hoveredElement); hoveredElement = null; }
        clearSelection();
        dismissPromptLayer();
      }
      selectEnabled = next;
    }
  });

  window.addEventListener('error', function (e) {
    window.parent.postMessage({ type: 'D2C_ERROR', message: e.message || 'unknown' }, PARENT_ORIGIN);
  });

  window.addEventListener('unhandledrejection', function (e) {
    var msg = (e.reason && (e.reason.message || String(e.reason))) || 'unhandled promise rejection';
    window.parent.postMessage({ type: 'D2C_ERROR', message: msg }, PARENT_ORIGIN);
  });

  window.parent.postMessage({ type: 'D2C_IFRAME_READY' }, PARENT_ORIGIN);
})();
`;
