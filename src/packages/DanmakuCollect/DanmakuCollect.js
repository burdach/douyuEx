function initPkg_DanmakuCollect() {
  initPkg_DanmakuCollect_Dom();
  const textarea = document.getElementsByClassName("ChatSend-txt")[0];
  const collectButton = document.getElementsByClassName("ChatBarrageCollect")[0];
  if (textarea && collectButton) {
    textarea.addEventListener("keyup", () => {
      const length = getChatInputText(textarea).length;
      if (length > 25) {
        collectButton.style.display = "none";
      } else {
        collectButton.style.display = "";
      }
    });
  }
  const sendBtn = document.getElementsByClassName("ChatSend-button")[0];
  if (sendBtn && collectButton) {
    sendBtn.addEventListener("click", () => {
      collectButton.style.display = "";
    });
  }
  responseHook((url, text) => {
    if (url.includes(`bulletscreen/query`)) {
      try {
        let obj = JSON.parse(text);
        if (obj && obj.data && Array.isArray(obj.data.list)) {
          obj.data.list.unshift(...getLocalDanmakuCollect().map(item => {
            return {
              content: item.content,
              type: 2,
              id: item.id
            }
          }));
          return JSON.stringify(obj);
        }
      } catch (e) {}
    }
  });

  responseHook((url, text, body) => {
    if (url.includes(`bulletscreen/add`)) {
      try {
        let obj = JSON.parse(text);
        if (!obj || obj.error == 0) return text;
        let { content } = JSON.parse(body || "{}");
        if (content) {
          addLocalDanmakuCollect(content);
        }
        obj.msg = "收藏成功，云收藏已达上限，将收藏至本地（由DouyuEx插件实现无限收藏）";

        // 关闭并重新打开弹幕收藏以更新新添加的弹幕
        const tipDom = document.querySelector(".ChatBarrageCollect-tip");
        if (tipDom) {
          tipDom.click();
          tipDom.click();
        }
        return JSON.stringify(obj);
      } catch (e) {}
    }
  });

  responseHook((url, text, body) => {
    if (url.includes(`bulletscreen/del`)) {
      try {
        let { id } = JSON.parse(body || "{}");
        if (id != null) {
          delLocalDanmakuCollect(id);
        }
      } catch (e) {}
    }
  });
}

function initPkg_DanmakuCollect_Dom() {
  let pollCount = 0;
  let timer = setInterval(() => {
    pollCount++;
    if (typeof document.getElementsByClassName("ChatBarrageCollect")[0] != "undefined") {
      clearInterval(timer);
      new DomHook(".ChatBarrageCollect", false, (m) => {
        const titleDom = document.getElementsByClassName("ChatBarrageCollectPop-title");
        if (!titleDom || titleDom.length === 0) {
          const existingInput = document.getElementById("ex-danmaku-collect-search");
          if (existingInput) {
            existingInput.removeEventListener("input", searchCollectDanmaku);
          }
          return;
        }
        if (document.getElementById("ex-danmaku-collect-search")) return;
        let inputDom = document.createElement("input");
        inputDom.id = "ex-danmaku-collect-search";
        inputDom.placeholder = "搜索弹幕";
        inputDom.style.marginLeft = "6px";
        titleDom[0].appendChild(inputDom);

        inputDom.addEventListener("input", searchCollectDanmaku);
      });
    } else if (pollCount >= 60) {
      clearInterval(timer);
    }
  }, 1000);
}

function searchCollectDanmaku(e) {
  const searchText = e.target.value;
  const contentDom = document.getElementsByClassName("ChatBarrageCollectPop-barrageContent")[0];
  if (!contentDom || !contentDom.parentElement) return;
  let parentDom = contentDom.parentElement;
  let danmakuDoms = parentDom.getElementsByClassName("TagItem");
  // 找出所有doms里面包含searchText的dom，其他全部display为none，如果searchText为空，则全部显示
  for (let i = 0; i < danmakuDoms.length; i++) {
    let danmakuDom = danmakuDoms[i];
    if (danmakuDom.innerText.includes(searchText)) {
      danmakuDom.style.display = "";
    } else {
      danmakuDom.style.display = "none";
    }
  }
}

function getLocalDanmakuCollect() {
  let ret = localStorage.getItem("ExSave_DanmakuCollect");
  try {
    ret = JSON.parse(ret) || [];
  } catch (error) {
    ret = [];
  }
  return ret;
}

function addLocalDanmakuCollect(content) {
  let ret = getLocalDanmakuCollect();
  ret.unshift({
    content,
    id: new Date().getTime()
  });
  localStorage.setItem("ExSave_DanmakuCollect", JSON.stringify(ret));
}

function delLocalDanmakuCollect(id) {
  let ret = getLocalDanmakuCollect();
  localStorage.setItem("ExSave_DanmakuCollect", JSON.stringify(ret.filter(item => item.id !== id)));
}