let exTabSwitchApplied = false;

function initPkg_ExpandTool_TabSwitch() {
  enableIgnoreAutoPause();
  ExpandTool_TabSwitch_insertDom();
  ExpandTool_TabSwitch_insertFunc();
  initPkg_ExpandTool_TabSwitch_Set();
}

function ExpandTool_TabSwitch_insertDom() {
  let b = document.getElementsByClassName("extool")[0];
  if (!b || document.getElementById("extool__tabSwitch")) return;
  let a = document.createElement("span");
  a.innerHTML = '<label title="阻止浏览器页签冻结"><input id="extool__tabSwitch" type="checkbox">防页签冻结</label>';
  b.insertBefore(a, b.childNodes[0] || null);
}


function isTabSwitchEnabled() {
  try {
    const ret = localStorage.getItem("ExSave_TabSwitch");
    if (ret != null) {
      return !!JSON.parse(ret).isEnableTabSwitch;
    }
  } catch (e) { }
  const el = document.getElementById("extool__tabSwitch");
  return el ? el.checked : false;
}

function setTabSwitchEnabled(enabled) {
  localStorage.setItem("ExSave_TabSwitch", JSON.stringify({ isEnableTabSwitch: !!enabled }));
  const el = document.getElementById("extool__tabSwitch");
  if (el) {
    el.checked = !!enabled;
  }
  if (enabled) {
    enableTabSwitch();
  }
}

function getTabSwitch() {
  return isTabSwitchEnabled();
}

function ExpandTool_TabSwitch_insertFunc() {
  const el = document.getElementById("extool__tabSwitch");
  if (!el) return;
  el.addEventListener("click", function() {
      const enabled = el.checked;
      setTabSwitchEnabled(enabled);
      if (!enabled) {
        showMessage("已关闭页面防挂机，请刷新页面生效", "info");
        if (window.__pip_is_active__ && typeof PictureInPictureControl_stopTabAntiFreeze === "function") {
          PictureInPictureControl_stopTabAntiFreeze();
        }
      }
  });
}

function saveData_TabSwitch() {
  const el = document.getElementById("extool__tabSwitch");
  if (el) setTabSwitchEnabled(el.checked);
}

function initPkg_ExpandTool_TabSwitch_Set() {
  let ret = localStorage.getItem("ExSave_TabSwitch");
  if (ret != null) {
    try {
      let retJson = JSON.parse(ret);
      if (retJson.isEnableTabSwitch) {
        const el = document.getElementById("extool__tabSwitch");
        if (el) el.checked = !!retJson.isEnableTabSwitch;
        enableTabSwitch();
      }
    } catch (e) {}
  }
}

function enableTabSwitch() {
  if (exTabSwitchApplied) return;
  exTabSwitchApplied = true;
  try {
    Object.defineProperty(document, 'hidden', { value: false, writable: false, configurable: true });
  } catch (e) {}
  try {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false, configurable: true });
  } catch (e) {}
  try {
    Object.defineProperty(document, 'webkitVisibilityState', { value: 'visible', writable: false, configurable: true });
  } catch (e) {}
  document.dispatchEvent(new Event('visibilitychange'));
  document.hasFocus = function () { return true; };

  document.addEventListener('visibilitychange', function(e) {
    e.stopImmediatePropagation();
  }, true);
}

function enableIgnoreAutoPause() {
  // 防止直播自动暂停
  try {
    localStorage.setItem("freetimed", "1");
  } catch (e) {}
}
