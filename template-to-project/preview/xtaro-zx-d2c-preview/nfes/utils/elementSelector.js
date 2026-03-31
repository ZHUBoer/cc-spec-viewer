let selectedElement = null;
var PARENT_ORIGIN = "*";
var inputCache = {};
var MESSAGE_TYPES = {
  AI_PROMPT: "aiPrompt",
  AI_STASH: "aiStash",
  TOGGLE_SELECT: "toggleSelectMode",
  STASH_STATUS: "stashStatus",
  PLATFORM: "platform",
  ERROR: "iframeError",
  IFRAME_LOADED: "iframeLoaded",
  REQUEST_REBUILD: "requestRebuild",
};

var state = {
  enableSelect: false,
  isStash: false,
  platform: "h5",
};

function clearSelection() {
  if (selectedElement) {
    selectedElement.style.outline = "";
    selectedElement.style.outlineOffset = "";
    selectedElement.style.backgroundColor = "";
    selectedElement.style.transition = "";
    selectedElement.style.cursor = "";
    selectedElement = null;
  }
}

var hoveredElement = null;

function isInPromptLayer(element) {
  var current = element;
  while (current) {
    if (current.classList && current.classList.contains("prompt-layer")) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function setSelection(element) {
  clearSelection();
  selectedElement = element;
  if (element) {
    element.style.outline = "2px solid #ff3333";
    element.style.outlineOffset = "2px";
    element.style.transition = "all 0.1s ease";
    element.style.cursor = "pointer";
  }
}

function findCorehashElement(element) {
  if (!element) return null;

  let targetElement = element;
  let corehash = null;

  while (targetElement && targetElement !== document.body) {
    if (
      targetElement.dataset &&
      typeof targetElement.dataset.corehash !== "undefined"
    ) {
      corehash = targetElement.dataset.corehash;
    } else if (targetElement.getAttribute) {
      corehash = targetElement.getAttribute("data-corehash");
    }

    if (corehash) {
      break;
    }

    targetElement = targetElement.parentElement;
  }

  return corehash ? { targetElement, corehash } : null;
}

function findCoreHash(element) {
  var result = findCorehashElement(element);
  return result ? result.corehash : null;
}

function ensureWithinViewport(element, reference) {
  var rect = element.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    element.style.left = window.innerWidth - rect.width - 20 + "px";
  }

  if (rect.bottom > window.innerHeight) {
    var referenceTop = reference.getBoundingClientRect().top;
    var scrollY = window.scrollY;
    var calculatedTop = referenceTop + scrollY - rect.height - 10;

    var minTop = scrollY + 10;
    if (referenceTop <= 10 || calculatedTop < minTop) {
      element.style.top = minTop + "px";
    } else {
      element.style.top = calculatedTop + "px";
    }
  }
}

function safeRemoveElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function wrapEventHandler(fn) {
  return function (event) {
    try {
      return fn.call(this, event);
    } catch (error) {
      console.error("[ElementSelector] 事件处理错误:", error);
      return false;
    }
  };
}

function extractPromptLabel(nodeCode) {
  if (typeof nodeCode !== "string" || !nodeCode.trim()) {
    return null;
  }

  var firstTagMatch = nodeCode.match(/<\s*([A-Za-z][\w.-]*)\b([\s\S]*?)>/);
  if (!firstTagMatch) {
    return null;
  }

  var tagName = firstTagMatch[1] ? firstTagMatch[1].trim() : "";
  var attrs = firstTagMatch[2] || "";
  var classExpr = null;

  var classBraceMatch = attrs.match(/\bclassName\s*=\s*\{([\s\S]*?)\}/);
  if (classBraceMatch && classBraceMatch[1]) {
    classExpr = classBraceMatch[1].trim();
  } else {
    var classQuotedMatch = attrs.match(/\bclassName\s*=\s*["']([^"']+)["']/);
    if (classQuotedMatch && classQuotedMatch[1]) {
      classExpr = classQuotedMatch[1].trim();
    }
  }

  if (classExpr) {
    return classExpr;
  }
  return tagName || null;
}

function createPromptLayer(target, coreElement) {
  var existingLayer = document.querySelector(".prompt-layer");
  if (existingLayer) {
    safeRemoveElement(existingLayer);
  }

  var layer = document.createElement("div");
  layer.className = "prompt-layer";

  var rect = target.getBoundingClientRect();
  var viewportWidth =
    window.innerWidth ||
    (document.documentElement && document.documentElement.clientWidth) ||
    (document.body && document.body.clientWidth) ||
    0;
  var isMobile = viewportWidth > 0 && viewportWidth <= 480;

  layer.style.position = "absolute";
  layer.style.top = rect.bottom + window.scrollY + (isMobile ? 6 : 10) + "px";
  layer.style.left = rect.left + window.scrollX + "px";
  layer.style.backgroundColor = "#ffffff";
  layer.style.border = "1px solid rgba(0, 0, 0, 0.1)";
  layer.style.padding = isMobile ? "12px" : "16px";
  layer.style.borderRadius = isMobile ? "6px" : "8px";
  layer.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
  layer.style.zIndex = "1000";
  layer.style.width = isMobile
    ? Math.max(260, viewportWidth - 32) + "px"
    : "400px";
  layer.style.fontFamily =
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  var coreHash = findCoreHash(coreElement);
  var codeInfo =
    coreHash && window.__WebCoreAssistant__
      ? window.__WebCoreAssistant__[coreHash]
      : null;
  var codeInfoObj = null;
  if (codeInfo) {
    try {
      codeInfoObj = JSON.parse(codeInfo);
    } catch (e) {
      codeInfoObj = null;
    }
  }

  var inputContainer = document.createElement("div");

  var input = document.createElement("textarea");
  input.placeholder = "输入AI指令，比如：'优化这个按钮样式'";

  if (coreHash && Object.prototype.hasOwnProperty.call(inputCache, coreHash)) {
    input.value = inputCache[coreHash];
  }

  input.style.width = "100%";
  input.style.minHeight = "80px";
  input.style.padding = "12px";
  input.style.borderRadius = "6px";
  input.style.border = "1px solid #e5e5e5";
  input.style.resize = "vertical";
  input.style.fontFamily = "inherit";
  input.style.fontSize = "14px";
  input.style.boxSizing = "border-box";
  input.style.outline = "none";
  input.style.backgroundColor = "#ffffff";
  input.style.color = "#171717";
  input.style.transition = "border-color 0.15s ease, box-shadow 0.15s ease";

  input.addEventListener("blur", function () {
    if (coreHash) {
      inputCache[coreHash] = input.value;
    }
    input.style.borderColor = "#e5e5e5";
    input.style.boxShadow = "none";
  });

  input.addEventListener("focus", function () {
    input.style.borderColor = "#171717";
    input.style.boxShadow = "0 0 0 2px rgba(23, 23, 23, 0.1)";
  });

  inputContainer.appendChild(input);
  layer.appendChild(inputContainer);

  var bottomContainer = document.createElement("div");
  bottomContainer.style.display = "flex";
  bottomContainer.style.justifyContent = "space-between";
  bottomContainer.style.alignItems = "flex-end";
  bottomContainer.style.gap = "12px";
  bottomContainer.style.marginTop = "6px";

  var filenameContainer = document.createElement("div");
  filenameContainer.style.flex = "1";
  filenameContainer.style.minWidth = "0";
  if (codeInfoObj && typeof codeInfoObj.nodeCode === "string") {
    var labelText =
      extractPromptLabel(codeInfoObj.nodeCode) || codeInfoObj.filename;
    var classNameBlock = document.createElement("span");
    classNameBlock.innerText = labelText;
    classNameBlock.style.display = "inline-block";
    classNameBlock.style.maxWidth = "min(42vw, 180px)";
    classNameBlock.style.overflow = "hidden";
    classNameBlock.style.textOverflow = "ellipsis";
    classNameBlock.style.whiteSpace = "nowrap";
    classNameBlock.style.backgroundColor = "#f5f5f5";
    classNameBlock.style.color = "#262626";
    classNameBlock.style.padding = "4px 8px";
    classNameBlock.style.borderRadius = "4px";
    classNameBlock.style.fontSize = "12px";
    classNameBlock.style.cursor = "pointer";
    classNameBlock.style.border = "1px solid #e5e5e5";
    classNameBlock.style.userSelect = "none";

    var codePreviewCard = document.createElement("pre");
    codePreviewCard.textContent = codeInfoObj.nodeCode;
    codePreviewCard.style.position = "absolute";
    codePreviewCard.style.display = "none";
    codePreviewCard.style.zIndex = "1001";
    codePreviewCard.style.margin = "0";
    codePreviewCard.style.padding = "10px";
    codePreviewCard.style.border = "1px solid #d4d4d8";
    codePreviewCard.style.borderRadius = "6px";
    codePreviewCard.style.backgroundColor = "#ffffff";
    codePreviewCard.style.color = "#171717";
    codePreviewCard.style.fontSize = "12px";
    codePreviewCard.style.lineHeight = "1.5";
    codePreviewCard.style.fontFamily =
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    codePreviewCard.style.whiteSpace = "pre-wrap";
    codePreviewCard.style.overflowWrap = "anywhere";
    codePreviewCard.style.wordBreak = "break-word";
    codePreviewCard.style.overflow = "auto";
    codePreviewCard.style.maxWidth = "min(72vw, 560px)";
    codePreviewCard.style.maxHeight = "min(48vh, 320px)";
    codePreviewCard.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.12)";
    codePreviewCard.style.pointerEvents = "auto";
    codePreviewCard.style.cursor = "pointer";
    layer.appendChild(codePreviewCard);

    var previewHideTimer = null;
    var isLabelHovered = false;
    var isCardHovered = false;

    function clearPreviewHideTimer() {
      if (previewHideTimer) {
        clearTimeout(previewHideTimer);
        previewHideTimer = null;
      }
    }

    function hideCodePreviewCard() {
      codePreviewCard.style.display = "none";
    }

    function positionCodePreviewCard() {
      var tagRect = classNameBlock.getBoundingClientRect();
      var layerRect = layer.getBoundingClientRect();
      var viewportWidth =
        window.innerWidth ||
        (document.documentElement && document.documentElement.clientWidth) ||
        0;
      var viewportHeight =
        window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        0;
      var left = tagRect.left - layerRect.left;
      var maxLeft = Math.max(
        0,
        layer.clientWidth - codePreviewCard.offsetWidth,
      );
      var top = tagRect.top - layerRect.top - codePreviewCard.offsetHeight - 8;
      if (top < 0) {
        top = tagRect.bottom - layerRect.top + 8;
      }
      var clampedLeft = Math.max(0, Math.min(left, maxLeft));
      var clampedTop = Math.max(0, top);
      var previewRectWidth = codePreviewCard.offsetWidth;
      var previewRectHeight = codePreviewCard.offsetHeight;
      var absoluteLeft = layerRect.left + clampedLeft;
      var absoluteTop = layerRect.top + clampedTop;
      if (absoluteLeft + previewRectWidth > viewportWidth - 8) {
        clampedLeft = Math.max(
          0,
          Math.min(
            viewportWidth - layerRect.left - previewRectWidth - 8,
            maxLeft,
          ),
        );
      }
      if (absoluteTop + previewRectHeight > viewportHeight - 8) {
        clampedTop = Math.max(
          0,
          viewportHeight - layerRect.top - previewRectHeight - 8,
        );
      }
      codePreviewCard.style.left = clampedLeft + "px";
      codePreviewCard.style.top = clampedTop + "px";
    }

    function showCodePreviewCard() {
      clearPreviewHideTimer();
      codePreviewCard.style.display = "block";
      requestAnimationFrame(positionCodePreviewCard);
    }

    function scheduleHideCodePreviewCard() {
      clearPreviewHideTimer();
      previewHideTimer = setTimeout(function () {
        if (!isLabelHovered && !isCardHovered) {
          hideCodePreviewCard();
        }
      }, 80);
    }

    classNameBlock.addEventListener("mouseenter", function () {
      isLabelHovered = true;
      showCodePreviewCard();
    });
    classNameBlock.addEventListener("mouseleave", function () {
      isLabelHovered = false;
      scheduleHideCodePreviewCard();
    });
    codePreviewCard.addEventListener("mouseenter", function () {
      isCardHovered = true;
      clearPreviewHideTimer();
    });
    codePreviewCard.addEventListener("mouseleave", function () {
      isCardHovered = false;
      scheduleHideCodePreviewCard();
    });

    filenameContainer.appendChild(classNameBlock);
  }

  var buttonGroup = document.createElement("div");
  buttonGroup.style.display = "flex";
  buttonGroup.style.flexDirection = "row";
  buttonGroup.style.gap = "12px";
  buttonGroup.style.flexShrink = "0";

  function createButton(text, messageType, variant) {
    var button = document.createElement("button");
    button.innerText = text;
    button.style.border = "none";
    button.style.padding = "6px 14px";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";
    button.style.transition = "background-color 0.15s ease, opacity 0.15s ease";

    // 根据变体设置颜色
    if (variant === "secondary") {
      button.style.backgroundColor = "#ffffff";
      button.style.color = "#171717";
      button.style.border = "1px solid #e5e5e5";
    } else {
      button.style.backgroundColor = "#171717";
      button.style.color = "#ffffff";
      button.style.border = "1px solid #171717";
    }

    // Hover 效果
    button.addEventListener("mouseenter", function () {
      if (variant === "secondary") {
        button.style.backgroundColor = "#f5f5f5";
      } else {
        button.style.opacity = "0.9";
      }
    });

    button.addEventListener("mouseleave", function () {
      if (variant === "secondary") {
        button.style.backgroundColor = "#ffffff";
      } else {
        button.style.opacity = "1";
      }
    });

    button.addEventListener("click", function (e) {
      e.stopPropagation();
      var prompt = input.value.trim();
      if (!prompt) return;

      var payload = {
        type: messageType,
        prompt: prompt,
        codeInfo: codeInfo || null,
      };

      window.parent.postMessage(payload, PARENT_ORIGIN);
      safeRemoveElement(layer);
    });

    return button;
  }

  var stashButton = createButton("暂存", MESSAGE_TYPES.AI_STASH, "secondary");
  var submitButton = createButton("提交", MESSAGE_TYPES.AI_PROMPT, "primary");

  // 根据 isStash 状态控制提交按钮显示
  submitButton.style.display = state.isStash ? "none" : "block";

  buttonGroup.appendChild(stashButton);
  buttonGroup.appendChild(submitButton);

  bottomContainer.appendChild(filenameContainer);
  bottomContainer.appendChild(buttonGroup);

  layer.appendChild(bottomContainer);

  document.addEventListener(
    "click",
    wrapEventHandler(function closePrompt(e) {
      if (!layer.contains(e.target) && e.target !== target) {
        safeRemoveElement(layer);
        document.removeEventListener("click", closePrompt, true);
      }
    }),
    true,
  );

  document.body.appendChild(layer);
  setTimeout(function () {
    input.focus();
  }, 100);

  ensureWithinViewport(layer, target);
}

function sendMessageToParent(corehash, relationData) {
  try {
    const message = {
      type: "ELEMENT_SELECTED",
      payload: {
        corehash: corehash,
        relationData: {
          filename: relationData.filename,
          fileDir: relationData.fileDir,
          line: relationData.line,
          endLine: relationData.endLine,
          nodeCode: relationData.nodeCode,
          nodeStartLine: relationData.nodeStartLine,
          nodeEndLine: relationData.nodeEndLine,
        },
        timestamp: Date.now(),
      },
    };

    window.parent.postMessage(message, PARENT_ORIGIN);
  } catch (error) {
    console.error("[PostMessage] 发送消息失败:", error);
  }
}

function handleElementClick(event) {
  if (!state.enableSelect) return;

  const element = event.target;
  if (!element) return;

  if (isInPromptLayer(element)) {
    return;
  }

  const result = findCorehashElement(element);
  if (!result) {
    clearSelection();
    var existingLayer = document.querySelector(".prompt-layer");
    if (existingLayer) {
      safeRemoveElement(existingLayer);
    }
    return;
  }

  const { targetElement } = result;

  setSelection(targetElement);

  createPromptLayer(element, targetElement);
}

document.addEventListener(
  "mousemove",
  wrapEventHandler(function (event) {
    if (!state.enableSelect) return;

    var element = event.target;
    if (!element) return;

    if (isInPromptLayer(element)) {
      if (hoveredElement && hoveredElement !== selectedElement) {
        hoveredElement.style.outline = "";
      }
      hoveredElement = null;
      return;
    }

    if (hoveredElement && hoveredElement !== selectedElement) {
      hoveredElement.style.outline = "";
    }

    var result = findCorehashElement(element);
    hoveredElement = result ? result.targetElement : null;

    if (hoveredElement && hoveredElement !== selectedElement) {
      hoveredElement.style.outline = "2px solid #ff3333";
      hoveredElement.style.outlineOffset = "2px";
    }
  }),
  true,
);

function isHydrationError(message) {
  if (!message) return false;
  var messageStr = String(message).toLowerCase();
  return (
    messageStr.includes("hydration failed") ||
    messageStr.includes("hydration error") ||
    messageStr.includes("hydration mismatch")
  );
}

function initErrorListener() {
  var handleError = wrapEventHandler(function (event) {
    if (isHydrationError(event.message)) {
      console.warn("[ElementSelector] 检测到水合错误，已忽略:", event.message);
      return;
    }

    var errorMessage = {
      type: MESSAGE_TYPES.ERROR,
      error: {
        message: event.message,
      },
    };

    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage(errorMessage, PARENT_ORIGIN);
    }

    console.error("[ElementSelector] JavaScript错误:", errorMessage);
  });

  var handleUnhandledRejection = wrapEventHandler(function (event) {
    var reasonMessage =
      event.reason && event.reason.message
        ? event.reason.message
        : String(event.reason);

    if (isHydrationError(reasonMessage)) {
      console.warn("[ElementSelector] 检测到水合错误，已忽略:", reasonMessage);
      return;
    }

    var errorMessage = {
      type: MESSAGE_TYPES.ERROR,
      error: {
        message: reasonMessage,
      },
    };

    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage(errorMessage, PARENT_ORIGIN);
    }

    console.error("[ElementSelector] Promise拒绝错误:", errorMessage);
  });

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
}

/** 保存 message 监听器引用，便于移除后重新注册 */
var _messageHandler = null;

function notifyIframeLoaded() {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(
      { type: MESSAGE_TYPES.IFRAME_LOADED },
      PARENT_ORIGIN,
    );
  }
}

function requestRebuild() {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(
      { type: MESSAGE_TYPES.REQUEST_REBUILD },
      PARENT_ORIGIN,
    );
    console.log("[ElementSelector] 已请求父页面触发重新编译");
  }
}

function initMessageListener() {
  if (_messageHandler) {
    window.removeEventListener("message", _messageHandler);
    _messageHandler = null;
  }
  _messageHandler = wrapEventHandler(function (e) {
    if (!e.data || !e.data.type) return;

    if (e.data.type === MESSAGE_TYPES.TOGGLE_SELECT) {
      var isEnabled = !!e.data.enable;

      if (state.enableSelect && !isEnabled) {
        if (hoveredElement) {
          hoveredElement.style.outline = "";
          hoveredElement = null;
        }
        if (selectedElement) {
          clearSelection();
        }

        var promptLayer = document.querySelector(".prompt-layer");
        if (promptLayer) {
          safeRemoveElement(promptLayer);
        }
      }

      state.enableSelect = isEnabled;
    }

    if (e.data.type === MESSAGE_TYPES.STASH_STATUS) {
      var isStash = !!e.data.isStash;
      state.isStash = isStash;

      var submitButton = document.querySelector(
        ".prompt-layer button:last-child",
      );
      if (submitButton) {
        submitButton.style.display = isStash ? "none" : "block";
      }
    }
  });
  window.addEventListener("message", _messageHandler);
}

function initElementSelector() {
  initErrorListener();

  initMessageListener();
  notifyIframeLoaded();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      document.addEventListener(
        "click",
        wrapEventHandler(handleElementClick),
        true,
      );
    });
  } else {
    document.addEventListener(
      "click",
      wrapEventHandler(handleElementClick),
      true,
    );
  }
}

if (typeof window !== "undefined") {
  initElementSelector();

  window.addEventListener("load", function () {
    initMessageListener();
    notifyIframeLoaded();
    requestRebuild();
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      initMessageListener();
      notifyIframeLoaded();
      requestRebuild();
    }
  });
}
