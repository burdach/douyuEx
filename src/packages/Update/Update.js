// 版本号由 src/main.js @version 与 src/common.js curVersion 统一维护
// 原 douyuex.com 更新服务已于 2026-08-07 停服，本模块已禁用所有外部更新请求
var isNeedUpdate = false;
var lastestVersion = "";

function initPkg_Update() {
  // 已禁用原 douyuex.com 更新图标与远程版本检查
}

async function Update_checkVersion(isShowNotUpdate = false) {
  isNeedUpdate = false;
  lastestVersion = typeof curVersion !== "undefined" ? curVersion : "";
  if (isShowNotUpdate && typeof showMessage === "function") {
    showMessage(`【版本信息】当前版本 ${lastestVersion}（自动更新检查已禁用）`, "info");
  }
  return [false, lastestVersion];
}

function Update_showTip(a) {
  let d = document.getElementById("ex-update__tip");
  if (!d) return;
  d.style.display = a ? "block" : "none";
}
