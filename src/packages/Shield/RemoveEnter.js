let isRemoveEnterBarrage = getLocalIsRemoveEnterBarrage();

function applyRemoveEnterBarrage(enabled) {
  const isSupported = window.CSS && window.CSS.supports && window.CSS.supports("--enter-display", "none");
  const barrageExtendContainer = document.getElementById("js-barrage-extend-container");
  if (enabled) {
    StyleHook_set(
      "Ex_Style_RemoveEnter",
      `
        #js-barrage-extend-container,
        #js-barrage-extendList,
        .Barrage-userEnter,
        .Barrage-listItem.is-extendBarrage {
          display: none !important;
        }
      `
    );
    if (isSupported && barrageExtendContainer) {
      barrageExtendContainer.style.setProperty("--enter-display", "none", "important");
    }
  } else {
    StyleHook_remove("Ex_Style_RemoveEnter");
    if (isSupported && barrageExtendContainer) {
      barrageExtendContainer.style.setProperty("--enter-display", "block", "important");
    }
  }
}

function initPkg_Shield_RemoveEnter() {
  const shieldTool = document.getElementsByClassName("FilterKeywords")[0];
  if (!shieldTool) return;
  if (document.getElementById("ex-removeEnterBarrage")) return;

  shieldTool.insertAdjacentHTML(
    "afterbegin",
    `<div class="FilterSwitchStatus" id="ex-removeEnterBarrage">
    <h3>屏蔽进场弹幕</h3>
    <div>
      <span class="FilterSwitchStatus-status ${isRemoveEnterBarrage ? "is-checked" : "is-noChecked"}">${isRemoveEnterBarrage ? "已开启" : "未开启"}</span>
      <span class="FilterSwitchStatus-switch ${isRemoveEnterBarrage ? "is-checked" : "is-noChecked"}">
        <span class="FilterSwitchStatus-switch-inner"></span>
      </span>
    </div>
  </div>`
  );

  applyRemoveEnterBarrage(isRemoveEnterBarrage);

  const dom = document.getElementById("ex-removeEnterBarrage");
  if (!dom) return;
  const statusSpan = dom.querySelector(".FilterSwitchStatus-status");
  const switchSpan = dom.querySelector(".FilterSwitchStatus-switch");
  dom.addEventListener("click", () => {
    isRemoveEnterBarrage = !isRemoveEnterBarrage;
    applyRemoveEnterBarrage(isRemoveEnterBarrage);
    if (statusSpan) {
      statusSpan.classList.toggle("is-checked", isRemoveEnterBarrage);
      statusSpan.classList.toggle("is-noChecked", !isRemoveEnterBarrage);
      statusSpan.textContent = isRemoveEnterBarrage ? "已开启" : "未开启";
    }
    if (switchSpan) {
      switchSpan.classList.toggle("is-checked", isRemoveEnterBarrage);
      switchSpan.classList.toggle("is-noChecked", !isRemoveEnterBarrage);
    }
    saveRemoveEnterBarrage();
  });
}

function getLocalIsRemoveEnterBarrage() {
  const ret = localStorage.getItem("ExSave_isRemoveEnterBarrage");
  return ret ? Number(ret) === 1 : false; // 默认为false（不屏蔽进场弹幕）
}

function saveRemoveEnterBarrage() {
  localStorage.setItem("ExSave_isRemoveEnterBarrage", isRemoveEnterBarrage ? 1 : 0);
}