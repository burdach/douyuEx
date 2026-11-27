function initPkg_Shield() {
  // 立即应用已保存的屏蔽状态（不依赖打开 .BarrageFilter，也不在脚本解析期提前执行）
  initPkg_Shield_ApplySaved();
  // 在 ExPanel 中挂载始终可用的“屏蔽特效弹幕”一键开关（未登录也可直接使用）
  initPkg_Shield_ExPanelButton();

  let pollCount = 0;
  let t2 = null;
  let t = setInterval(() => {
    pollCount++;
    if (typeof document.getElementsByClassName("BarrageFilter")[0] !== "undefined") {
      clearInterval(t);
      new DomHook(".BarrageFilter", false, (m) => {
        if (m.length === 0) return;
        if (m[0].addedNodes.length > 0 && m[0].removedNodes.length === 0) {
          const domFilterKeywords = document.getElementsByClassName("FilterKeywords")[0];
          if (domFilterKeywords) {
            initPkg_Shield_Enable();
          } else {
            if (t2) {
              clearInterval(t2);
              t2 = null;
            }
            let t2Count = 0;
            t2 = setInterval(() => {
              t2Count++;
              const domFilterKeywordsNow = document.getElementsByClassName("FilterKeywords")[0];
              if (domFilterKeywordsNow) {
                clearInterval(t2);
                t2 = null;
                initPkg_Shield_Enable();
              } else if (t2Count >= 40) {
                clearInterval(t2);
                t2 = null;
              }
            }, 50);
          }
        }
      });
    } else if (pollCount >= 60) {
      clearInterval(t);
    }
  }, 1000);
}

function initPkg_Shield_ApplySaved() {
  if (isRemoveDanmakuBackground) {
    removeDanmakuBackground();
  }
  if (isRemoveEnterBarrage) {
    applyRemoveEnterBarrage(true);
  }
  if (isRemoveRepeatedDanmaku) {
    removeRepeatedDanmaku();
  }
}

function initPkg_Shield_ExPanelButton() {
  const tryMount = () => {
    const wrap = document.getElementsByClassName("ex-panel__wrap")[0];
    if (!wrap) return false;
    if (document.getElementById("ex-shield-effect-btn")) {
      syncShieldEffectUI();
      return true;
    }

    const a = document.createElement("div");
    a.className = "ex-shield-effect";
    a.innerHTML = `<a class="ex-panel__icon ${isRemoveDanmakuBackground ? "is-active" : ""}" id="ex-shield-effect-btn" title="${isRemoveDanmakuBackground ? "屏蔽特效弹幕：已开启（点击关闭）" : "屏蔽特效弹幕：未开启（点击开启）"}"><svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 4.01-2.55 7.77-6 8.85-3.45-1.08-6-4.84-6-8.85V6.43l6-2.25z" fill="currentColor"></path><path d="M12 6.8l1.1 2.25 2.48.36-1.8 1.75.43 2.47L12 12.46l-2.21 1.17.43-2.47-1.8-1.75 2.48-.36L12 6.8z" fill="currentColor" opacity="0.45"></path><path d="M6.8 6.8l10.4 10.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg><i id="ex-shield-effect__tip" class="ex-panel__tip"></i></a>`;
    wrap.insertBefore(a, wrap.childNodes[0]);

    const btn = document.getElementById("ex-shield-effect-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        toggleRemoveDanmakuBackground(true);
      });
    }
    syncShieldEffectUI();
    return true;
  };

  if (tryMount()) return;
  let retry = 0;
  const mountTimer = setInterval(() => {
    retry++;
    if (tryMount() || retry >= 20) {
      clearInterval(mountTimer);
    }
  }, 500);
}

function initPkg_Shield_Enable() {
  initPkg_Shield_RemoveRepeatedDanmaku();
  initPkg_Shield_RemoveEnter();
  initPkg_Shield_RemoveDanmakuBackground();
}