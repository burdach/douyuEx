let isRemoveDanmakuBackground = getLocalIsRemoveDanmakuBackground();

function initPkg_Shield_RemoveDanmakuBackground() {
  const shieldTool = document.getElementsByClassName("FilterKeywords")[0];
  if (!shieldTool) return;
  if (document.getElementById("ex-removeDanmakuBackground")) {
    syncShieldEffectUI();
    return;
  }
  shieldTool.insertAdjacentHTML(
    "afterbegin",
    `<div class="FilterSwitchStatus" id="ex-removeDanmakuBackground">
    <h3>屏蔽特效弹幕</h3>
    <div>
      <span class="FilterSwitchStatus-status ${isRemoveDanmakuBackground ? "is-checked" : "is-noChecked"}">${isRemoveDanmakuBackground ? "已开启" : "未开启"}</span>
      <span class="FilterSwitchStatus-switch ${isRemoveDanmakuBackground ? "is-checked" : "is-noChecked"}">
        <span class="FilterSwitchStatus-switch-inner"></span>
      </span>
    </div>
  </div>`
  );

  const dom = document.getElementById("ex-removeDanmakuBackground");
  if (!dom) return;
  dom.addEventListener("click", () => {
    toggleRemoveDanmakuBackground(false);
  });
  syncShieldEffectUI();
}

function toggleRemoveDanmakuBackground(showToast) {
  isRemoveDanmakuBackground = !isRemoveDanmakuBackground;
  if (isRemoveDanmakuBackground) {
    removeDanmakuBackground();
  } else {
    StyleHook_remove("Ex_Style_RemoveDanmakuBackground");
  }
  saveRemoveDanmakuBackground();
  syncShieldEffectUI();
  if (showToast && typeof showMessage === "function") {
    showMessage(
      isRemoveDanmakuBackground ? "【屏蔽特效弹幕】已开启" : "【屏蔽特效弹幕】已关闭",
      isRemoveDanmakuBackground ? "success" : "info"
    );
  }
}

function syncShieldEffectUI() {
  const dom = document.getElementById("ex-removeDanmakuBackground");
  if (dom) {
    const statusSpan = dom.querySelector(".FilterSwitchStatus-status");
    const switchSpan = dom.querySelector(".FilterSwitchStatus-switch");
    if (statusSpan) {
      statusSpan.classList.toggle("is-checked", isRemoveDanmakuBackground);
      statusSpan.classList.toggle("is-noChecked", !isRemoveDanmakuBackground);
      statusSpan.textContent = isRemoveDanmakuBackground ? "已开启" : "未开启";
    }
    if (switchSpan) {
      switchSpan.classList.toggle("is-checked", isRemoveDanmakuBackground);
      switchSpan.classList.toggle("is-noChecked", !isRemoveDanmakuBackground);
    }
  }

  const exBtn = document.getElementById("ex-shield-effect-btn");
  if (exBtn) {
    exBtn.classList.toggle("is-active", isRemoveDanmakuBackground);
    exBtn.title = isRemoveDanmakuBackground
      ? "屏蔽特效弹幕：已开启（点击关闭）"
      : "屏蔽特效弹幕：未开启（点击开启）";
  }
}

function getLocalIsRemoveDanmakuBackground() {
  const ret = localStorage.getItem("ExSave_isRemoveDanmakuBackground");
  return ret ? Number(ret) === 1 : false;
}

function saveRemoveDanmakuBackground() {
  localStorage.setItem("ExSave_isRemoveDanmakuBackground", isRemoveDanmakuBackground ? 1 : 0);
}

function removeDanmakuBackground() {
  StyleHook_set(
    "Ex_Style_RemoveDanmakuBackground",
    `
      /* 视频弹幕：去除自定义背景、边框、阴影、皮肤、渐变，保留纯净可读文字 */
      .danmuItem-a8616a,
      [class*="danmuItem-"],
      .danmuItem-a8616a div,
      [class*="danmuItem-"] div,
      [class*="danmuItem-"] [class*="textWrap-"],
      .super-text-f60bfa,
      [class*="super-text-"],
      .danmuItem-a8616a .noble-d35c82,
      [class*="danmuItem-"] [class*="noble-"],
      .customBarrage,
      .customBarrage > div,
      [class*="PlayerCustomBarrage"] {
        background: none !important;
        background-color: transparent !important;
        background-image: none !important;
        border: none !important;
        border-image: none !important;
        box-shadow: none !important;
      }
      .customBarrage {
        text-shadow: none !important;
      }
      [class*="danmuItem-"]::before,
      [class*="danmuItem-"]::after,
      [class*="danmuItem-"] > div::before,
      [class*="danmuItem-"] > div::after,
      [class*="super-text-"]::before,
      [class*="super-text-"]::after,
      [class*="noble-"]::before,
      [class*="noble-"]::after {
        background: none !important;
        background-image: none !important;
        border: none !important;
        box-shadow: none !important;
      }

      /* 视频弹幕：隐藏附加图标、图片、前后缀与尾巴 */
      .danmuItem-a8616a > img,
      .danmuItem-a8616a div > img,
      [class*="danmuItem-"] img,
      .afterpic-e66834,
      [class*="danmuItem-"] [class*="afterpic-"],
      [class*="danmuItem-"] [class*="beforepic-"],
      [class*="danmuItem-"] [class*="super-noble-icon-"],
      [class*="danmuItem-"] [class*="super-user-icon-"],
      [class*="danmuItem-"] [class*="super-tail-"],
      .PlayerCustomBarrage-prefixPlugin--text,
      [class*="PlayerCustomBarrage-prefix"],
      [class*="PlayerCustomBarrage-suffix"],
      [class*="PlayerCustomBarrage-tail"],
      [class*="PlayerCustomBarrage"] img {
        display: none !important;
      }

      /* 视频弹幕：隐藏 AI 看点、活动推广弹幕、居中停留巨型弹幕 */
      .ai-highlight-cbaf68,
      [class*="danmuItem-"][class*="ai-highlight-"],
      [class*="danmuItem-"].undefined,
      .retentionDanmuDiv-f48113,
      [class*="retentionDanmuDiv-"] {
        display: none !important;
      }

      /* 视频内特效层、宝箱广播横幅、SVGA / Spine / 礼物动画层 */
      .DanmuEffectDom,
      #douyu_room_normal_player_danmuEffect,
      #douyu_room_normal_player_danmuDom_barrage,
      #douyu_room_normal_player_danmuDom_counter,
      .customBc-a275a7,
      [class*="customBc-"],
      .layout-Player-effect,
      #js-spine-player,
      #js-svgaV1-player {
        display: none !important;
      }

      /* 聊天区：隐藏进场特效、顶部悬浮特效弹幕与 AI 摘要卡片 */
      #js-barrage-extend-container,
      #js-barrage-extendList,
      .Barrage-userEnter,
      .Barrage-listItem.is-extendBarrage,
      #js-floatingbarrage-container,
      .Barrage-topFloaterList,
      .AiLiveSummaryBarrage {
        display: none !important;
      }

      /* 聊天区：去除花哨气泡/贵族/粉丝特效背景，保留普通聊天文本可读性 */
      #js-barrage-list .Barrage-listItem .js-fansfloating-barragecont,
      #js-barrage-list .Barrage-listItem .Barrage-notice--noble,
      #js-barrage-list .Barrage-listItem .Barrage-roomVip--super,
      #js-barrage-list .Barrage-listItem [class*="Barrage-noble"],
      #js-barrage-list .Barrage-listItem [class*="barragecont"],
      #js-barrage-list .Barrage-listItem > div[style*="background-image"],
      #js-barrage-list .Barrage-listItem [class*="barrage"][style*="background-image"],
      #js-barrage-list .Barrage-listItem [class*="Barrage"][style*="background-image"]:not(.Barrage-icon):not([class*="Barrage-icon--"]) {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border-color: transparent !important;
        box-shadow: none !important;
      }
      #js-barrage-list .Barrage-listItem .js-fansfloating-barragecont::before,
      #js-barrage-list .Barrage-listItem .js-fansfloating-barragecont::after {
        display: none !important;
      }
  `
  );
}