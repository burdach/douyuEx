let video_num = 0;
let refresh_Video_isHidden = false;
let refresh_Video_hoverTimeout = 0;
let refresh_Video_isHoveringPill = false;

function initPkg_Refresh_Video() {
    Refresh_Video_insertExPanelIcon();
    Refresh_Video_registerContextMenu();
    initPkg_Refresh_Video_Set();

    if (Refresh_Video_mountHoverPill()) {
        return;
    }
    let timer = setInterval(() => {
        if (Refresh_Video_mountHoverPill()) {
            clearInterval(timer);
            return;
        }
        video_num++;
        if (video_num >= 40) {
            clearInterval(timer);
        }
    }, 500);
}

function Refresh_Video_insertExPanelIcon() {
    if (document.getElementById("ex-panel-hide-giftbar")) {
        return;
    }
    const wrap = document.getElementsByClassName("ex-panel__wrap")[0];
    if (!wrap) {
        return;
    }
    const a = document.createElement("div");
    a.id = "ex-panel-hide-giftbar";
    a.className = "refresh-video-panel-icon";
    a.innerHTML = `<a class="ex-panel__icon" title="隐藏礼物栏"><svg class="icon" viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="8" width="18" height="4" rx="1" stroke="#33363A" stroke-width="1.8"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 8v12M12 8H8.5a2 2 0 1 1 0-4C10.8 4 12 8 12 8zm0 0h3.5a2 2 0 1 0 0-4C13.2 4 12 8 12 8z" stroke="#33363A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`;
    a.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleRefreshVideo();
    });
    wrap.insertBefore(a, wrap.childNodes[0] || null);
}

function Refresh_Video_registerContextMenu() {
    const injectIntoMenu = (menu) => {
        if (!menu || menu.querySelector("#refresh-video")) {
            return;
        }
        const a = document.createElement("li");
        a.id = "refresh-video";
        a.innerText = refresh_Video_isHidden ? "✓ 隐藏礼物栏" : "隐藏礼物栏";
        a.addEventListener("click", () => {
            toggleRefreshVideo();
        });
        menu.insertBefore(a, menu.childNodes[menu.childNodes.length - 1] || null);
    };

    if (typeof VideoTools_registerContextMenu === "function") {
        VideoTools_registerContextMenu("refresh-video", injectIntoMenu);
    } else {
        const menu = document.querySelector('ul.menu-da2a9e, #__video_container ul[class*="menu-"]');
        if (menu) {
            injectIntoMenu(menu);
        }
    }
}

function Refresh_Video_hidePill() {
    const pill = document.getElementById("refresh-video3");
    if (!pill || refresh_Video_isHoveringPill) return;
    pill.style.transition = "opacity .15s ease,transform .15s ease,background-color .15s ease,box-shadow .3s ease";
    pill.style.opacity = "0";
    pill.style.transform = "scale(.9)";
    pill.style.pointerEvents = "none";
    clearTimeout(refresh_Video_hoverTimeout);
}

function Refresh_Video_showPill() {
    const pill = document.getElementById("refresh-video3");
    if (!pill) return;
    pill.style.transition = "opacity .15s ease,transform .15s ease,background-color .15s ease,box-shadow .3s ease";
    pill.style.opacity = "1";
    pill.style.transform = "scale(1)";
    pill.style.pointerEvents = "auto";
    clearTimeout(refresh_Video_hoverTimeout);
    refresh_Video_hoverTimeout = setTimeout(() => {
        Refresh_Video_hidePill();
    }, 2000);
}

function Refresh_Video_mountHoverPill() {
    const host = getValidDom(["#js-player-dialog", "#__video_container", ".room-Player-Box"]);
    if (!host) {
        return false;
    }
    if (!document.getElementById("refresh-video3")) {
        const a = document.createElement("div");
        a.id = "refresh-video3";
        a.title = refresh_Video_isHidden ? "点击显示礼物栏" : "点击隐藏礼物栏";
        a.innerHTML = `<div style="display:flex;align-items:center;gap:6px;">
            <div style="font-size:12px;">隐藏礼物栏</div>
            <div id="ex-refresh-switch" style="width:26px;height:14px;background:rgba(255,255,255,0.3);border-radius:7px;position:relative;transition:background 0.3s;">
                <div id="ex-refresh-switch-circle" style="width:10px;height:10px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:left 0.3s, background 0.3s;"></div>
            </div>
        </div>`;
        a.style.cssText = "position:absolute;left:18px;bottom:58px;padding:0 10px;height:28px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);color:#fff;z-index:9999;cursor:pointer;user-select:none;opacity:0;transform:scale(.9);transition:opacity .15s ease,transform .15s ease,background-color .15s ease,box-shadow .3s ease;pointer-events:none;";
        host.insertBefore(a, host.childNodes[0] || null);

        a.addEventListener("mouseenter", () => {
            refresh_Video_isHoveringPill = true;
            a.style.transition = "opacity .15s ease,transform .15s ease,background-color .15s ease,box-shadow .3s ease";
            a.style.opacity = "1";
            a.style.transform = "scale(1.08)";
            a.style.pointerEvents = "auto";
            a.style.backgroundColor = "rgba(0,0,0,.7)";
            clearTimeout(refresh_Video_hoverTimeout);
        });
        a.addEventListener("mouseleave", () => {
            refresh_Video_isHoveringPill = false;
            a.style.transform = "scale(1)";
            a.style.backgroundColor = "rgba(0,0,0,.55)";
            Refresh_Video_showPill();
        });
        a.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleRefreshVideo();
        });

        const dom = getValidDom([".layout-Player-video", ".stream__T55I3", "#__video_container"]);
        const domVideo = getValidDom([".room-Player-Box", "#__h5player"]);
        if (dom) {
            dom.addEventListener("mouseenter", Refresh_Video_showPill);
            dom.addEventListener("mouseleave", Refresh_Video_hidePill);
        }
        if (domVideo) {
            domVideo.addEventListener("mousemove", Refresh_Video_showPill);
        }
    }
    updateRefreshSwitchUI(refresh_Video_isHidden);
    return true;
}

function Refresh_Video_syncAllUI(animate) {
    const domRefresh = document.getElementById("refresh-video");
    if (domRefresh) {
        domRefresh.innerText = refresh_Video_isHidden ? "✓ 隐藏礼物栏" : "隐藏礼物栏";
    }

    const domRefresh3 = document.getElementById("refresh-video3");
    if (domRefresh3) {
        domRefresh3.title = refresh_Video_isHidden ? "点击显示礼物栏" : "点击隐藏礼物栏";
        if (animate && refresh_Video_isHidden) {
            domRefresh3.style.transition = "opacity .3s ease,transform .3s cubic-bezier(0.175, 0.885, 0.32, 1.275),background-color .3s ease,box-shadow .3s ease";
            domRefresh3.style.opacity = "1";
            domRefresh3.style.transform = "scale(1.1)";
            domRefresh3.style.pointerEvents = "auto";
            domRefresh3.style.backgroundColor = "rgba(0,0,0,.8)";
            domRefresh3.style.boxShadow = "0 0 15px rgba(255, 102, 0, 0.6)";

            clearTimeout(refresh_Video_hoverTimeout);
            refresh_Video_hoverTimeout = setTimeout(() => {
                domRefresh3.style.transition = "opacity .15s ease,transform .15s ease,background-color .15s ease,box-shadow .15s ease";
                domRefresh3.style.transform = "scale(1)";
                domRefresh3.style.backgroundColor = "rgba(0,0,0,.55)";
                domRefresh3.style.boxShadow = "none";
                refresh_Video_hoverTimeout = setTimeout(() => {
                    Refresh_Video_hidePill();
                }, 1500);
            }, 800);
        } else if (!refresh_Video_isHidden) {
            domRefresh3.style.opacity = "0";
            domRefresh3.style.transform = "scale(.9)";
            domRefresh3.style.pointerEvents = "none";
        }
    }
    updateRefreshSwitchUI(refresh_Video_isHidden);

    if (typeof VideoToolbarMenu_syncHideGiftBarUI === "function") {
        VideoToolbarMenu_syncHideGiftBarUI(refresh_Video_isHidden);
    }

    const extoolCheckbox = document.getElementById("extool__hidegiftbar");
    if (extoolCheckbox) {
        extoolCheckbox.checked = refresh_Video_isHidden;
    }

    const panelBtn = document.getElementById("ex-panel-hide-giftbar");
    if (panelBtn) {
        panelBtn.classList.toggle("is-active", refresh_Video_isHidden);
        const link = panelBtn.querySelector("a");
        if (link) {
            link.title = refresh_Video_isHidden ? "显示礼物栏" : "隐藏礼物栏";
        }
    }
}

function setRefreshVideoHidden(hidden, options) {
    const opts = options || {};
    refresh_Video_isHidden = !!hidden;

    if (document.body) {
        document.body.classList.toggle("ex-hide-gift-bar", refresh_Video_isHidden);
    }
    if (document.documentElement) {
        document.documentElement.classList.toggle("ex-hide-gift-bar", refresh_Video_isHidden);
    }

    if (refresh_Video_isHidden) {
        refresh_Video_setStyle();
        if (typeof ExPanel_onGiftBarHide === "function") {
            ExPanel_onGiftBarHide();
        }
    } else {
        refresh_Video_removeStyle();
        if (typeof ExPanel_onGiftBarShow === "function") {
            ExPanel_onGiftBarShow();
        }
    }

    Refresh_Video_syncAllUI(!!opts.animate);

    if (!opts.skipSave && typeof saveData_Refresh === "function") {
        saveData_Refresh();
    }
    if (typeof resizeWindow === "function") {
        resizeWindow();
    }
}

function toggleRefreshVideo() {
    setRefreshVideoHidden(!refresh_Video_isHidden, { animate: true });
}

function updateRefreshSwitchUI(isSimpleMode) {
    let swBg = document.getElementById("ex-refresh-switch");
    let swCircle = document.getElementById("ex-refresh-switch-circle");
    if (swBg && swCircle) {
        if (isSimpleMode) {
            swBg.style.background = "#f60";
            swCircle.style.left = "14px";
        } else {
            swBg.style.background = "rgba(255,255,255,0.3)";
            swCircle.style.left = "2px";
        }
    }
}

function refresh_Video_getStatus() {
    if (refresh_Video_isHidden) {
        return true;
    }
    if (document.body && document.body.classList.contains("ex-hide-gift-bar")) {
        return true;
    }
    return false;
}

function initPkg_Refresh_Video_Set() {
    let ret = localStorage.getItem("ExSave_Refresh");
    if (ret != null) {
        try {
            let retJson = JSON.parse(ret);
            if (retJson && retJson.video && retJson.video.status === true) {
                setRefreshVideoHidden(true, { animate: false, skipSave: true });
            }
        } catch (e) {}
    }
}

function refresh_Video_setStyle() {
    StyleHook_set("Ex_Style_VideoRefresh", `
    .PELact,.pushTower-wrapper-gf1HG,[class*="pushTower-wrapper-"],.PkView-9f6a2c,[class*="PkView-"],.MorePk,.RandomPKBar,.LiveRoomLoopVideo,.LiveRoomDianzan,.maiMaitView-68e80c,[class*="maiMaitView-"],.PkView{display:none !important;}
    `);
}

function refresh_Video_removeStyle() {
    StyleHook_remove("Ex_Style_VideoRefresh");
}
