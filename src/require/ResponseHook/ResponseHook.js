let responseHookCallbackList = [];
let requestBodyMap = new WeakMap(); // 使用WeakMap存储请求体和XMLHttpRequest实例的关联，避免内存泄漏

function initResponseHook() {
  if (typeof unsafeWindow === "undefined" || !unsafeWindow.XMLHttpRequest) {
    return;
  }
  const proto = unsafeWindow.XMLHttpRequest.prototype;
  const originalSend = proto.send;
  if (typeof originalSend !== "function") {
    return;
  }

  // 重写send方法以捕获请求体
  proto.send = function (body) {
    try {
      requestBodyMap.set(this, body);
    } catch (e) {}

    return originalSend.call(this, body);
  };

  // 重写responseText的getter以处理响应
  const accessor = Object.getOwnPropertyDescriptor(proto, "responseText");
  if (!accessor || typeof accessor.get !== "function") {
    return;
  }
  Object.defineProperty(proto, "responseText", {
    get: function () {
      let text = accessor.get.call(this);
      let requestBody;
      try {
        requestBody = requestBodyMap.has(this) ? requestBodyMap.get(this) : undefined;
      } catch (e) {
        requestBody = undefined;
      }

      for (const callback of responseHookCallbackList) {
        try {
          const newText = callback(this.responseURL, text, requestBody);
          if (newText !== undefined) {
            text = newText;
          }
        } catch (err) {
          console.warn("[DouyuEx] ResponseHook callback failed:", err);
        }
      }

      return text;
    },
    configurable: true,
  });
}

/**
 * 对网页上的请求进行hook
 * @param {(url: string, text: string, body: any)} callback - 回调函数，接收URL、响应文本和请求体作为参数
 */
function responseHook(callback) {
  responseHookCallbackList.push(callback);
}
