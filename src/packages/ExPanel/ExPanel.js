let ExPanel_anchorParent = null;
let ExPanel_anchorNextSibling = null;
let ExPanel_resizeBound = false;

function ExPanel_isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function initPkg_ExPanel() {
    initPkg_ExPanel_insertDom();

    let exPanelDOM = document.querySelector(`.ex-panel`);
    if (!exPanelDOM) {
        return;
    }
    exPanelDOM.addEventListener(`mouseenter`, () => {
        clearTimeout(exPanelTimer);
    });
    exPanelDOM.addEventListener(`mouseleave`, () => {
        clearTimeout(exPanelTimer);
        exPanelTimer = setTimeout(autoCloseExPanelHandle, 800);
    });
    const closeBtn = exPanelDOM.querySelector(".ex-panel__close");
    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            hideExPanel();
        });
    }
    if (!ExPanel_resizeBound) {
        ExPanel_resizeBound = true;
        window.addEventListener("resize", () => {
            const panel = document.querySelector(".ex-panel.ex-panel--floating");
            if (panel && panel.style.display === "block") {
                ExPanel_updateFloatingPosition();
            }
        });
    }
}

function ExPanel_getGiftBarAnchor() {
    const selectors = [
        ".PlayerToolbar-ContentCell .PlayerToolbar-Wealth",
        ".InteractABAd-aside",
        ".ToolbarGiftArea-container",
        ".PlayerToolbar-ContentRow",
        ".PlayerToolbar",
        "#js-player-toolbar"
    ];
    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (ExPanel_isVisible(el)) {
            return el;
        }
    }
    return null;
}

function ExPanel_isGiftBarHidden() {
    if (typeof refresh_Video_getStatus === "function" && refresh_Video_getStatus()) {
        return true;
    }
    if (
        (document.body && (
            document.body.classList.contains("ex-hide-gift-bar") ||
            document.body.classList.contains("is-fullScreenPage") ||
            document.body.classList.contains("is-fullScreen")
        )) ||
        (document.documentElement && document.documentElement.classList.contains("ex-hide-gift-bar"))
    ) {
        return true;
    }
    const row = document.getElementsByClassName("PlayerToolbar-ContentRow")[0];
    if (row && row.style.visibility === "hidden") {
        return true;
    }
    return !ExPanel_getGiftBarAnchor();
}

function ExPanel_getFloatingHost() {
    // Always mount floating panel on document.body so ancestor transforms on
    // #js-player-dialog / .room-Player-Box never break position: fixed.
    return document.body || document.documentElement;
}

function ExPanel_saveAnchor(panel) {
    if (!ExPanel_anchorParent && panel && panel.parentNode && panel.parentNode !== document.body) {
        ExPanel_anchorParent = panel.parentNode;
        ExPanel_anchorNextSibling = panel.nextSibling;
    }
}

function ExPanel_applyGiftBarPosition(panel, anchor) {
    if (!panel) return;
    const domPlayerToolbar = document.querySelector(".PlayerToolbar") || document.getElementById("js-player-toolbar");
    if (anchor && domPlayerToolbar) {
        const anchorStyle = window.getComputedStyle ? window.getComputedStyle(anchor) : null;
        if (anchorStyle && anchorStyle.position !== "static" && anchor !== domPlayerToolbar) {
            const aRect = anchor.getBoundingClientRect();
            const tRect = domPlayerToolbar.getBoundingClientRect();
            const dist = Math.round(aRect.bottom - tRect.top);
            panel.style.bottom = (dist > 0 ? dist : (anchor.offsetHeight + 8)) + "px";
        } else {
            panel.style.bottom = (domPlayerToolbar.offsetHeight || 76) + "px";
        }
    } else if (domPlayerToolbar) {
        panel.style.bottom = (domPlayerToolbar.offsetHeight || 76) + "px";
    } else {
        panel.style.bottom = "76px";
    }
}

function ExPanel_updateFloatingPosition() {
    const panel = document.querySelector(".ex-panel.ex-panel--floating");
    if (!panel) {
        return;
    }
    const vtoolbarMenu = document.getElementById("ex-vtoolbar-menu");
    const gap = 8;
    const margin = 8;
    const panelWidth = panel.offsetWidth || panel.scrollWidth || 320;
    const panelHeight = panel.offsetHeight || 48;

    panel.style.position = "fixed";
    panel.style.top = "auto";
    panel.style.zIndex = "10000";

    // Prefer anchoring above #ex-vtoolbar-menu only when controlbar is visible and on-screen
    if (vtoolbarMenu) {
        const hiddenBar = vtoolbarMenu.closest('[class*="hide-"].is-hidden, .is-hidden');
        const menuRect = vtoolbarMenu.getBoundingClientRect();
        const isMenuOnScreen = !hiddenBar
            && menuRect.width > 0
            && menuRect.height > 0
            && menuRect.top > 40
            && menuRect.top < window.innerHeight - 10
            && menuRect.right > 0
            && menuRect.left < window.innerWidth;

        if (isMenuOnScreen) {
            let bottom = window.innerHeight - menuRect.top + gap;
            bottom = Math.max(margin, Math.min(bottom, Math.max(margin, window.innerHeight - panelHeight - margin)));
            let left = menuRect.left + menuRect.width / 2 - panelWidth / 2;
            left = Math.max(margin, Math.min(left, Math.max(margin, window.innerWidth - panelWidth - margin)));
            panel.style.bottom = `${Math.round(bottom)}px`;
            panel.style.left = `${Math.round(left)}px`;
            panel.style.right = "auto";
            return;
        }
    }

    // Fallback: anchor cleanly to bottom-right of visible player container, clamped to viewport
    const videoBox = getValidDom(["#__video_container", "#js-player-video", ".stream__T55I3", ".layout-Player-video"]);
    if (videoBox && ExPanel_isVisible(videoBox)) {
        const vRect = videoBox.getBoundingClientRect();
        let bottom = window.innerHeight - vRect.bottom + 56;
        bottom = Math.max(64, Math.min(bottom, Math.max(16, window.innerHeight - panelHeight - 16)));
        let right = window.innerWidth - vRect.right + 16;
        right = Math.max(16, Math.min(right, Math.max(16, window.innerWidth - panelWidth - 16)));
        panel.style.bottom = `${Math.round(bottom)}px`;
        panel.style.right = `${Math.round(right)}px`;
        panel.style.left = "auto";
        return;
    }

    // Ultimate viewport bottom-right fallback
    panel.style.bottom = "72px";
    panel.style.right = "24px";
    panel.style.left = "auto";
}

function ExPanel_attachToFloatingHost() {
    const panel = document.querySelector(".ex-panel");
    if (!panel) {
        return;
    }
    const host = ExPanel_getFloatingHost();
    if (!host) {
        return;
    }
    if (panel.classList.contains("ex-panel--floating") && panel.parentNode === host) {
        ExPanel_updateFloatingPosition();
        return;
    }
    ExPanel_saveAnchor(panel);
    host.appendChild(panel);
    panel.classList.add("ex-panel--floating");
    ExPanel_updateFloatingPosition();
}

function ExPanel_restoreToGiftBar() {
    const panel = document.querySelector(".ex-panel");
    const anchor = ExPanel_getGiftBarAnchor();
    if (!panel || !anchor) {
        return;
    }
    if (!panel.classList.contains("ex-panel--floating") && panel.parentNode === anchor) {
        return;
    }
    if (ExPanel_anchorNextSibling && ExPanel_anchorNextSibling.parentNode === anchor) {
        anchor.insertBefore(panel, ExPanel_anchorNextSibling);
    } else {
        anchor.insertBefore(panel, anchor.childNodes[0] || null);
    }
    panel.classList.remove("ex-panel--floating");
    // Clear all floating inline styles before re-applying gift-bar positioning
    panel.style.position = "";
    panel.style.top = "";
    panel.style.left = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.zIndex = "";
    ExPanel_applyGiftBarPosition(panel, anchor);
}

function ExPanel_syncHost() {
    if (ExPanel_isGiftBarHidden()) {
        ExPanel_attachToFloatingHost();
    } else {
        ExPanel_restoreToGiftBar();
    }
}

function ExPanel_onGiftBarHide() {
    const panel = document.querySelector(".ex-panel");
    if (panel) {
        ExPanel_attachToFloatingHost();
        if (panel.style.display === "block") {
            ExPanel_updateFloatingPosition();
        }
    }
}

function ExPanel_onGiftBarShow() {
    ExPanel_restoreToGiftBar();
}

function initPkg_ExPanel_insertDom() {
    if (document.querySelector(".ex-panel")) {
        return;
    }
	let a = document.createElement("div");
	a.className = "ex-panel";
	a.innerHTML = `<button type="button" class="ex-panel__close" title="关闭工具条" aria-label="关闭 DouyuEx 工具条">×</button><div class="ex-panel__wrap"></div>`;

    let b = ExPanel_getGiftBarAnchor();
    if (!b) {
        b = ExPanel_getFloatingHost();
        a.classList.add("ex-panel--floating");
        if (b) {
            b.appendChild(a);
        }
    } else {
        b.insertBefore(a, b.childNodes[0] || null);
        ExPanel_applyGiftBarPosition(a, b);
        ExPanel_saveAnchor(a);
    }
    if (ExPanel_isGiftBarHidden()) {
        ExPanel_attachToFloatingHost();
    }
}

function hideExPanel() {
    const exPanelDOM = document.querySelector(".ex-panel");
    if (!exPanelDOM) {
        return;
    }
    clearTimeout(exPanelTimer);
    exPanelTimer = null;
    exPanelDOM.style.display = "none";
}

function autoCloseExPanelHandle() {
    hideExPanel();
}

function showExPanel() {
	let a = document.getElementsByClassName("ex-panel")[0];
    if (!a) {
        return;
    }
    ExPanel_syncHost();
	if (a.style.display !== 'block') {
        a.style.display = 'block';
        clearTimeout(exPanelTimer);
        if (a.classList.contains("ex-panel--floating")) {
            ExPanel_updateFloatingPosition();
        }
    } else {
        a.style.display = 'none';
        clearTimeout(exPanelTimer);
    }
}