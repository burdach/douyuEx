/**
 * 拦截并修改特定 Script 标签的内容
 * 数组结构：
 * [
 *  { url: "", callback: (content: string) => string },
 *  { inline: true, callback: (content: string) => string }
 * ]
 * 支持多个 callback，会按注册顺序依次执行，前一个 callback 的输出作为下一个 callback 的输入
 */
let scriptHookCallbackList = [];

function applyInlineScriptHooks(node) {
  if (!node || node.tagName !== "SCRIPT" || node.src || !node.textContent) {
    return node;
  }

  const inlineCallbacks = scriptHookCallbackList.filter((item) => item.inline);
  if (inlineCallbacks.length === 0) {
    return node;
  }

  let content = node.textContent;
  for (let i = 0; i < inlineCallbacks.length; i++) {
    try {
      const next = inlineCallbacks[i].callback(content);
      if (typeof next === "string") {
        content = next;
      }
    } catch (err) {
      console.warn("[DouyuEx] ScriptHook inline callback failed:", err);
    }
  }

  if (content !== node.textContent) {
    node.textContent = content;
  }

  return node;
}

function handleExternalScript(node, insertFn, appendFn, targetNode, referenceNode) {
  const src = node.src;
  const callbacks = [];

  for (let k = 0; k < scriptHookCallbackList.length; k++) {
    const item = scriptHookCallbackList[k];
    if (!item.inline && src.includes(item.url)) {
      callbacks.push(item);
    }
  }

  if (callbacks.length === 0) {
    return false;
  }

  fetchAndReplace(node, callbacks, targetNode, insertFn, appendFn, referenceNode);
  return true;
}

function initScriptHook() {
  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.appendChild = function (node) {
    if (node && node.tagName === "SCRIPT") {
      if (node.src && handleExternalScript(node, originalAppendChild, originalAppendChild, this, null)) {
        return node;
      }
      node = applyInlineScriptHooks(node);
    }

    return originalAppendChild.call(this, node);
  };

  Node.prototype.insertBefore = function (node, referenceNode) {
    if (node && node.tagName === "SCRIPT") {
      if (node.src && handleExternalScript(node, originalInsertBefore, originalAppendChild, this, referenceNode)) {
        return node;
      }
      node = applyInlineScriptHooks(node);
    }

    return originalInsertBefore.call(this, node, referenceNode);
  };
}

function notifyScriptHookEvent(node, eventType) {
  if (!node) {
    return;
  }
  try {
    node.dispatchEvent(new Event(eventType));
  } catch (err) {
    try {
      const handler = eventType === "load" ? node.onload : node.onerror;
      if (typeof handler === "function") {
        handler.call(node, { type: eventType, target: node, currentTarget: node });
      }
    } catch (cbErr) {
      console.warn(`[DouyuEx] ScriptHook ${eventType} handler failed:`, cbErr);
    }
  }
}

/**
 * 获取源码、修改并注入的函数
 * @param {HTMLScriptElement} origNode - 原始脚本节点
 * @param {Array} callbacks - 匹配到的回调函数列表
 * @param {Node} targetNode - 原始脚本应该插入的父节点
 * @param {Function} insertFn - 原始插入方法
 * @param {Function} appendFn - 原始 appendChild 方法
 * @param {Node|null} referenceNode - insertBefore 参考节点
 */
function fetchAndReplace(origNode, callbacks, targetNode, insertFn, appendFn, referenceNode) {
  const url = origNode.src;
  const insertModified = (scriptEl) => {
    try {
      if (referenceNode && referenceNode.parentNode === targetNode) {
        insertFn.call(targetNode, scriptEl, referenceNode);
      } else {
        const host = targetNode || document.head || document.documentElement;
        if (host) {
          appendFn.call(host, scriptEl);
        }
      }
    } catch (err) {
      const fallbackHost = document.head || document.documentElement;
      if (fallbackHost) {
        appendFn.call(fallbackHost, scriptEl);
      }
    }
  };

  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    onload: function (response) {
      if (response.status >= 400 || typeof response.responseText !== "string") {
        console.error("[DouyuEx] ScriptHook HTTP error:", response.status, url);
        notifyScriptHookEvent(origNode, "error");
        return;
      }
      let modifiedContent = response.responseText;

      for (let m = 0; m < callbacks.length; m++) {
        try {
          const next = callbacks[m].callback(modifiedContent);
          if (typeof next === "string") {
            modifiedContent = next;
          }
        } catch (err) {
          console.warn("[DouyuEx] ScriptHook external callback failed:", err);
        }
      }

      const newScript = document.createElement("script");
      newScript.type = origNode.type || "text/javascript";
      newScript.textContent = modifiedContent;
      insertModified(newScript);
      notifyScriptHookEvent(origNode, "load");
    },
    onerror: function (err) {
      console.error("[DouyuEx] Error loading script via GM_xmlhttpRequest:", err);
      notifyScriptHookEvent(origNode, "error");
    },
    ontimeout: function () {
      console.error("[DouyuEx] Timeout loading script via GM_xmlhttpRequest:", url);
      notifyScriptHookEvent(origNode, "error");
    }
  });
}

function scriptHook(callback) {
  scriptHookCallbackList.push(callback);
}
