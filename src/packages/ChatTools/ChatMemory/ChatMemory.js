let barrageMemoryArr = [];
let barrageMemoryIndex = 0; // 当前 指向索引
let prevTextareaPosition = 0;
const BARRAGE_MEMORY_LIMIT = 200;
function initPkg_ChatMemory() {
    initPkg_ChatMemory_Func();
}

function initPkg_ChatMemory_Func() {
    const chatTxt = document.getElementsByClassName("ChatSend-txt")[0];
    if (chatTxt) {
        chatTxt.addEventListener("keydown", (e) => {
            let dom = e.target;
            if (e.keyCode == 38) {
                // ↑
                if (getTextareaPosition(dom) == 0) {
                    barrageMemoryIndex = barrageMemoryIndex > 0 ? barrageMemoryIndex - 1 : barrageMemoryIndex;
                    chatMemory_setBarrage();
                }
            } else if (e.keyCode == 40) {
                // ↓
                const length = getChatInputText(dom).length;
                if (getTextareaPosition(dom) == length) {
                    barrageMemoryIndex = barrageMemoryIndex < barrageMemoryArr.length - 1 ? barrageMemoryIndex + 1 : barrageMemoryIndex;
                    chatMemory_setBarrage();
                }
            } else if (e.keyCode == 13) {
                // enter
                chatMemory_pushBarrage(getBarrageValue());
            }
        });
    }
    const chatBtn = document.getElementsByClassName("ChatSend-button")[0];
    if (chatBtn) {
        chatBtn.addEventListener("click", () => {
            // 点击弹幕发送按钮
            chatMemory_pushBarrage(getBarrageValue());
        });
    }
}

function chatMemory_pushBarrage(txt) {
    if (barrageMemoryArr.length >= BARRAGE_MEMORY_LIMIT) {
        barrageMemoryArr.shift();
        barrageMemoryIndex = Math.min(barrageMemoryIndex, barrageMemoryArr.length);
    }
    barrageMemoryIndex = barrageMemoryArr.push(txt);
}

function chatMemory_setBarrage() {
    if (barrageMemoryArr[barrageMemoryIndex] == undefined) {
        return;
    }
    setBarrageValue(barrageMemoryArr[barrageMemoryIndex] || "");
}

function getBarrageValue() {
    let dom = document.getElementsByClassName("ChatSend-txt")[0];
    return getChatInputText(dom);
}
function setBarrageValue(txt) {
    let dom = document.getElementsByClassName("ChatSend-txt")[0];
    setChatInputText(dom, txt);
}