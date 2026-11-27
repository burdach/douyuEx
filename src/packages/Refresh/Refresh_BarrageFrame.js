function initPkg_Refresh_BarrageFrame() {
	initPkg_Refresh_BarrageFrame_Dom();
    initPkg_Refresh_BarrageFrame_Func();
    initPkg_Refresh_BarrageFrame_Set();
}

function initPkg_Refresh_BarrageFrame_Dom() {
	Refresh_BarrageFrame_insertIcon();
}
function Refresh_BarrageFrame_insertIcon() {
    if (document.getElementById("refresh-barrage-frame")) return;
	let b = document.getElementsByClassName("Barrage-toolbar")[0];
	if (!b) return;
	let a = document.createElement("a");
    a.className = "refresh-barrage";
    a.id = "refresh-barrage-frame";
	a.innerHTML = '<svg t="1588051109604" id="refresh-barrage-frame__svg" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3095" width="16" height="16"><path d="M512 128 192 448h192v448h256V448h192L512 128z" fill="#AFAFAF" p-id="3096"></path></svg><i class="Barrage-toolbarIcon"></i><span id="refresh-barrage-frame__text" class="Barrage-toolbarText">拉高</span>';
	b.insertBefore(a, b.childNodes[0] || null);
}

function initPkg_Refresh_BarrageFrame_Func() {
    const btn = document.getElementById("refresh-barrage-frame");
    if (!btn) return;
	btn.addEventListener("click", function() {
        let dom_rank = document.getElementsByClassName("layout-Player-rank")[0];
        let dom_activity = document.getElementById("js-room-activity");
        let dom_topBarrage = document.getElementsByClassName("Barrage")[0];
        if (!dom_rank) return;
        if (dom_rank.style.display == "none") {
            // 被拉高
            dom_rank.style.display = "block";
            if (dom_activity) dom_activity.style.display = "block";
            if (dom_topBarrage) dom_topBarrage.classList.remove("top-0-important");
            const txt = document.getElementById("refresh-barrage-frame__text");
            if (txt) {
                txt.innerText = "拉高";
                txt.style.color = "";
            }
            btn.classList.remove("ex-active");
            let svg = document.getElementById("refresh-barrage-frame__svg");
            if (svg) {
                let p = svg.getElementsByTagName("path")[0];
                if (p) p.setAttribute("fill", "#AFAFAF");
            }
            saveData_Refresh();

        } else {
            PostbirdAlertBox.confirm({
                'title': '提示',
                'content': '是否拉高弹幕框，隐藏日榜周榜',
                'okBtn': '确定',
                'cancelBtn': '取消',
                'onConfirm': function () {
                    dom_rank.style.display = "none";
                    if (dom_activity) dom_activity.style.display = "none";
                    if (dom_topBarrage) dom_topBarrage.classList.add("top-0-important");
                    const txt = document.getElementById("refresh-barrage-frame__text");
                    if (txt) {
                        txt.innerText = "拉高";
                        txt.style.color = "#fff";
                    }
                    btn.classList.add("ex-active");
                    let svg = document.getElementById("refresh-barrage-frame__svg");
                    if (svg) {
                        let p = svg.getElementsByTagName("path")[0];
                        if (p) p.setAttribute("fill", "#ffffff");
                    }
                    saveData_Refresh();
                },
                'onCancel': function () {
                }
            });
        }
    });
}


function refresh_BarrageFrame_getStatus() {
    let dom_rank = document.getElementsByClassName("layout-Player-rank")[0];
    if (dom_rank && dom_rank.style.display == "none") {
        // 被拉高
        return true;
    } else {
        // 没拉高
        return false;
    }
}

function initPkg_Refresh_BarrageFrame_Set() {
    let ret = localStorage.getItem("ExSave_Refresh");
    if (ret != null) {
        try {
            let retJson = JSON.parse(ret);
            if ("barrageFrame" in retJson == false) {
                retJson.barrageFrame = {status: false};
            }
            if (retJson.barrageFrame.status == true) {
                let dom_rank = document.getElementsByClassName("layout-Player-rank")[0];
                let dom_activity = document.getElementById("js-room-activity");
                let dom_topBarrage = document.getElementsByClassName("Barrage")[0];
                if (dom_rank) dom_rank.style.display = "none";
                if (dom_activity) dom_activity.style.display = "none";
                if (dom_topBarrage) dom_topBarrage.classList.add("top-0-important");
                const btn = document.getElementById("refresh-barrage-frame");
                const txt = document.getElementById("refresh-barrage-frame__text");
                if (txt) {
                    txt.innerText = "拉高";
                    txt.style.color = "#fff";
                }
                if (btn) btn.classList.add("ex-active");
                let svg = document.getElementById("refresh-barrage-frame__svg");
                if (svg) {
                    let p = svg.getElementsByTagName("path")[0];
                    if (p) p.setAttribute("fill", "#ffffff");
                }
            }
        } catch (e) {}
    }
}
