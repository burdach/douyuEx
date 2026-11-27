function initPkg_DanmakuTail() {
    initPkg_DanmakuTail_insertDom();
    initPkg_DanmakuTail_Set();
    initPkg_DanmakuTail_Func();
}

function initPkg_DanmakuTail_insertDom() {
    let div = document.createElement("div");
    div.className = "ChatToolBar-DanmakuTail";
    div.innerHTML = `<div class="ChatToolBar-DanmakuTail-tip" title="弹幕小尾巴" ></div>`;
    let b = document.getElementsByClassName("ChatToolBar__left")[0];
    if (b) {
        b.appendChild(div);
    }

    let panel = document.createElement("div");
    panel.className = "ChatToolBar-DanmakuTail-Panel";
    let chat_panel = document.getElementsByClassName("layout-Player-chat")[0];
    if (!chat_panel) return;
    chat_panel.insertBefore(panel, chat_panel.childNodes[0]);

    const isLiveNext = document.body.classList.contains("live-next-body") || window.location.href.includes("/beta");
    if (!isLiveNext) {
        panel.style.bottom = "140px";
    }

    panel.innerHTML = `
        <div class="ChatToolBar-DanmakuTail-title">弹幕小尾巴</div>
        <input type="text" class="DanmakuTail-input" id="DanmakuTail-input" placeholder="请输入小尾巴内容"/>
        <div class="DanmakuTail-option-label">
            <label for="DanmakuTail-option-label1">
                <input type="radio" name="DanmakuTailType" value="1" id="DanmakuTail-option-label1"> 前缀
            </label>
            <label for="DanmakuTail-option-label2">
                <input type="radio" name="DanmakuTailType" value="2" id="DanmakuTail-option-label2" checked> 后缀
            </label>
        </div>
        <label class="DanmakuTail-checkbox-label">
            <input type="checkbox" class="DanmakuTail-checkbox" id="DanmakuTail-checkbox" />
            启用功能
        </label>
    `;
}

function initPkg_DanmakuTail_Set() {
    const checkbox = document.getElementById("DanmakuTail-checkbox");
    const input = document.getElementById("DanmakuTail-input");
    const radios = document.querySelectorAll('input[name="DanmakuTailType"]');
    if (!checkbox || !input || radios.length < 2) return;

    let ret = localStorage.getItem("ExSave_DanmakuTail");
    if (ret != null) {
        let retJson;
        try {
            retJson = JSON.parse(ret);
        } catch (e) {
            return;
        }
        if (!retJson) return;
        checkbox.checked = !!retJson.isTailEnabled;
        input.value = retJson.tailContent || "";
        input.disabled = !!retJson.isTailEnabled;
        radios[0].disabled = !!retJson.isTailEnabled;
        radios[1].disabled = !!retJson.isTailEnabled;
        if (!retJson.type) {
            const defaultRadio = document.querySelector(`input[name="DanmakuTailType"][value="2"]`);
            if (defaultRadio) defaultRadio.checked = true;
        } else {
            const targetRadio = document.querySelector(`input[name="DanmakuTailType"][value="${retJson.type}"]`);
            if (targetRadio) targetRadio.checked = true;
            saveData_DanmakuTail();
        }
        if (retJson.isTailEnabled) {
            const tip = document.querySelector(".ChatToolBar-DanmakuTail-tip");
            if (tip) tip.classList.add("ChatToolBar-DanmakuTail-tip-active");
        }
    }
}


function saveData_DanmakuTail() {
    const checkbox = document.getElementById("DanmakuTail-checkbox");
    const input = document.getElementById("DanmakuTail-input");
    const checkedRadio = document.querySelector('input[name="DanmakuTailType"]:checked');
    if (!checkbox || !input) return;
    let data = {
        isTailEnabled: checkbox.checked,
        tailContent: input.value,
        type: checkedRadio ? checkedRadio.value : "2"
    }
    localStorage.setItem("ExSave_DanmakuTail", JSON.stringify(data));
}


function initPkg_DanmakuTail_Func() {
    const tailBtn = document.getElementsByClassName("ChatToolBar-DanmakuTail")[0];
    if (tailBtn) {
        tailBtn.addEventListener("click", function () {
            showExRightPanel("弹幕小尾巴");
        });
    }

    initPkg_DanmakuTail_HandleFunc("#DanmakuTail-checkbox", "#DanmakuTail-input");

    const checkbox = document.getElementById("DanmakuTail-checkbox");
    if (checkbox) {
        checkbox.addEventListener("change", function () {
            saveData_DanmakuTail();
        });
    }
    document.querySelectorAll('input[name="DanmakuTailType"]').forEach((elem) => {
        elem.addEventListener("change", function () {
            saveData_DanmakuTail();
        });
    });
    const input = document.getElementById("DanmakuTail-input");
    if (input) {
        input.addEventListener("input", function () {
            saveData_DanmakuTail();
        });
    }

}


function initPkg_DanmakuTail_HandleFunc(checkboxSelector, inputSelector) {
    let keydownHandler = null;
    let clickHandler = null;

    // 开启
    function enable(content, type_value) {
        // 优先查找 textarea，如果没有则查找 div
        let textarea = document.querySelector("textarea.ChatSend-txt") || document.querySelector("div.ChatSend-txt") || document.getElementsByClassName("ChatSend-txt")[0];
        const button = document.querySelector(".ChatSend-button");
        if (!textarea || !button) return;

        disable(); // 防止重复绑定

        const getText = () => getChatInputText(textarea);
        const setText = (text) => {
            setChatInputText(textarea, text);
        };

        keydownHandler = function (e) {
            if (!e.isTrusted) return;
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                button.click();
            }
        };

        clickHandler = function (e) {
            const currentText = getText();
            if (currentText.trim() == "") return;
            
            let shouldAdd = false;
            if (type_value === "1") {
                // 前缀模式：检查是否以内容开头
                shouldAdd = !currentText.startsWith(content);
            } else {
                // 后缀模式：检查是否以内容结尾
                shouldAdd = !currentText.endsWith(content);
            }
            
            if (shouldAdd) {
                if (type_value === "1") {
                    setText(content + currentText);
                } else {
                    setText(currentText + content);
                }
            }
        };

        textarea.addEventListener("keydown", keydownHandler, true);
        button.addEventListener("click", clickHandler, true);
    }

    // 关闭
    function disable() {
        // 优先查找 textarea，如果没有则查找 div
        const textarea = document.querySelector("textarea.ChatSend-txt") || document.querySelector("div.ChatSend-txt") || document.getElementsByClassName("ChatSend-txt")[0];
        const button = document.querySelector(".ChatSend-button");
        if (textarea && keydownHandler) {
            textarea.removeEventListener("keydown", keydownHandler, true);
        }
        if (button && clickHandler) {
            button.removeEventListener("click", clickHandler, true);
        }
        keydownHandler = null;
        clickHandler = null;
    }

    // 监听 checkbox
    const checkbox = document.querySelector(checkboxSelector);
    const input = document.querySelector(inputSelector);
    const type = document.querySelectorAll('input[name="DanmakuTailType"]');
    const checkedTypeDom = document.querySelector('input[name="DanmakuTailType"]:checked');
    let type_value = checkedTypeDom ? checkedTypeDom.value : "2";

    if (checkbox && input) {
        checkbox.addEventListener("change", function () {

            if (input.value.trim() === "") {
                checkbox.checked = false;
                showMessage("【弹幕小尾巴】请输入弹幕小尾巴内容", "error");
                return;
            }

            input.disabled = checkbox.checked;
            if (type[0]) type[0].disabled = checkbox.checked;
            if (type[1]) type[1].disabled = checkbox.checked;
            const tip = document.querySelector(".ChatToolBar-DanmakuTail-tip");
            if (tip) tip.classList.remove("ChatToolBar-DanmakuTail-tip-active");

            disable();
            if (checkbox.checked && input) {
                if (tip) tip.classList.add("ChatToolBar-DanmakuTail-tip-active");
                let content = input.value.trim();
                const currentChecked = document.querySelector('input[name="DanmakuTailType"]:checked');
                type_value = currentChecked ? currentChecked.value : "2";
                enable(content, type_value);
            }
        });

        if (checkbox.checked && input) {
            enable(input.value.trim(), type_value);
        }
    }

    return { enable, disable };
}

