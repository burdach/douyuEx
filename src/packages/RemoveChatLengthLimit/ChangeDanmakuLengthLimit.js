function initPkg_ChangeDanmakuLengthLimit() {
  let count = 0;
  let timer = setInterval(() => {
    count++;
    if (count > 100) {
      clearInterval(timer);
      return;
    }
    let dom = document.getElementsByClassName("ChatSend-txt")[0];
    if (dom != undefined) {
      changeChatTextareaMaxLength();
      clearInterval(timer);
    }
  }, 1000);
}

function changeChatTextareaMaxLength() {
  const sendBtn = document.getElementsByClassName("ChatSend-button")[0];
  if (sendBtn != undefined) {
    sendBtn.classList.remove("is-gray");
  }
  const chatInput = document.getElementsByClassName("ChatSend-txt")[0];
  if (chatInput != undefined) {
    if (chatInput.tagName === "TEXTAREA") {
      const currentMax = Number(chatInput.maxLength);
      if (!Number.isNaN(currentMax) && currentMax > 0) {
        chatInput.maxLength = currentMax + 20; // 原来为50字符，修改成70字符
      }
    } else if (chatInput.isContentEditable || chatInput.getAttribute("contenteditable") === "true") {
      const maxAttr = parseInt(chatInput.getAttribute("maxlength"), 10);
      if (!Number.isNaN(maxAttr) && maxAttr > 0) {
        chatInput.setAttribute("maxlength", String(maxAttr + 20));
      }
    }
  }
}
