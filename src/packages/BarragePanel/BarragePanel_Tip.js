function initPkg_BarragePanel_Tip() {
    setBarragePanelTipCallBack();
}

function setBarragePanelTipCallBack() {
    let a = new DomHook("#comment-dzjy-container", false, (m) => {
        if (m.length <= 0) {
            return;
        }
        if (m[0].addedNodes.length <= 0) {
            return;
        }
        renderBarragePanelTip();
        setBarragePanelTipFunc();
    })
}

function renderBarragePanelTip() {
    if (document.getElementById("barrage-panel-tip__+1")) return;
    const labelDom = getValidDom([".labelfisrt-407af4", "#comment-dzjy-container [class*='labelfisrt-']"]);
    if (!labelDom || !labelDom.parentElement) return;
    const dom = labelDom.parentElement;

    let a = document.createElement("div");
    a.style.display = "inline-block";
    dom.appendChild(a);


    a = document.createElement("p");
    a.className = "sugun-e3fbf6";
    a.innerText = "|";
    dom.appendChild(a);

    a = document.createElement("div");
    a.className = "labelfisrt-407af4 thirdBtn-06cde5 fourBtn-0845d4";
    a.id = "barrage-panel-tip__+1";
    a.innerText = "+1";
    dom.appendChild(a);
}

function setBarragePanelTipFunc() {
    const plusOneBtn = document.getElementById("barrage-panel-tip__+1");
    if (!plusOneBtn) return;
    plusOneBtn.onclick = () => {
        const dom = document.getElementById("comment-higher-container");
        if (!dom) return;
        if (dom.getElementsByClassName("ex-image-danmaku").length > 0 && typeof getImageDanmakuFromImgSrc === "function") {
            const textDom = dom.querySelector(".text-879f3e, [class*='text-']");
            if (!textDom) return;
            sendBarrage(textDom.innerHTML.replace(/<a[^>]*><img\s+(?:.*?\s+)?src="(.*?)"[^>]*?\/?><\/a>/g, (match, src) => {
                return getImageDanmakuFromImgSrc(src);
            }));
        } else {
            sendBarrage(dom.innerText);
        }
    };
}
