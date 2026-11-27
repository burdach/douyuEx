let videoMetaData = null;
function initPkg_VideoTools_MetaData() {
  initPkg_VideoTools_MetaData_Dom();
  MetaData_init();
}

function initPkg_VideoTools_MetaData_Dom() {
  VideoTools_registerContextMenu("metadata", (menu) => {
    if (!videoMetaData) return false;
    if (!videoMetaData.dy_cpu_model && !videoMetaData.dy_gpu_model && !videoMetaData.dy_device_model && !videoMetaData.dy_os_version && !videoMetaData.z_canvas_code) return false;
    if (menu.querySelector("#ex-metadata")) return;
    let a = document.createElement("li");
    a.id = "ex-metadata";
    a.innerHTML = `
    主播配置信息
    <ul class="metadata__wrap">
      ${videoMetaData.dy_cpu_model ? `<li title="${videoMetaData.dy_cpu_model}">🤖CPU<br/>${videoMetaData.dy_cpu_model}</li>` : ``}
      ${videoMetaData.dy_gpu_model ? `<li title="${videoMetaData.dy_gpu_model}">🎮显卡<br/>${videoMetaData.dy_gpu_model}</li>` : ``}
      ${videoMetaData.dy_device_model ? `<li title="${videoMetaData.dy_device_model}">📱设备<br/>${videoMetaData.dy_device_model}</li>` : ``}
      ${videoMetaData.dy_os_version ? `<li title="${videoMetaData.dy_os_version}">🖥️系统<br/>${videoMetaData.dy_os_version}</li>` : ``}
      ${videoMetaData.z_canvas_code ? `<li title="${videoMetaData.z_canvas_code}">🎥场景<br/>${videoMetaData.z_canvas_code}</li>` : ``}
    </ul>
    `;
    menu.insertBefore(a, menu.childNodes[1] || null);
  });
}

function MetaData_init() {
  if (typeof getRealLive_Douyu !== "function") return;
  getRealLive_Douyu(rid, true, false, "1", (lurl) => {
    if (lurl != "" && lurl != null) {
      if (lurl == "None") {
        showMessage("房间未开播或其他错误", "error");
        return;
      }
      let id = "Fake";
      let existing = document.getElementById("exVideoDiv" + id);
      if (existing) existing.remove();
      let a = document.createElement("div");
      let html = "";
      a.id = "exVideoDiv" + id;
      a.className = "exVideoDiv";
      html += "<video controls='controls' class='exVideoPlayer' id='exVideoPlayer" + String(id) + "'></video><div class='exVideoScale' id='exVideoScale" + String(id) + "'></div>";
      a.innerHTML = html;
      let b = getValidDom([".layout-Main", ".playerWrap__8wGvw", ".live-next-body"]) || document.body;
      if (!b) return;
      b.insertBefore(a, b.childNodes[0] || null);
      if (typeof flvjs !== "undefined" && flvjs.isSupported()) {
        let videoElement = document.getElementById("exVideoPlayer" + id);
        if (!videoElement) return;
        let flvPlayer = flvjs.createPlayer(
          {
            type: "flv",
            url: lurl
          },
          { fixAudioTimestampGap: false }
        );
        flvPlayer.on("media_info", (e) => {
          if (e && e.metadata) {
            videoMetaData = e.metadata;
            let box = document.getElementById("exVideoDiv" + String(id));
            let exVideoPlayer = document.getElementById("exVideoPlayer" + String(id));
            try { flvPlayer.destroy(); } catch (err) {}
            if (exVideoPlayer) exVideoPlayer.remove();
            if (box) box.remove();
            initPkg_VideoTools_MetaData_Dom();
          }
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
      }
    }
  });
}