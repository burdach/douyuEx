let exFullScreenTimer = null;
let exHighestQualityTimer = null;
let exHighestQualityRunId = 0;

function initPkg_ExpandTool_FullScreen() {
    ExpandTool_FullScreen_insertDom();
    ExpandTool_FullScreen_insertFunc();
    ExpandTool_HighestVideoQuality_insertFunc();
    ExpandTool_HideGiftBar_insertFunc();
    initPkg_ExpandTool_FullScreen_Set();
    initPkg_ExpandTool_HighestVideoQuality_Set();
    initPkg_ExpandTool_HideGiftBar_Set();
}

function ExpandTool_FullScreen_insertDom() {
    let b = document.getElementsByClassName("extool")[0];
    if (!b || document.getElementById("extool__fullscreen")) {
        return;
    }
    let a = document.createElement("span");
    a.innerHTML = '<label title="自动网页全屏"><input id="extool__fullscreen" type="checkbox">自动网页全屏</label><label title="自动最高画质"><input id="extool__highestvideoquality" type="checkbox">自动最高画质</label><label title="隐藏底部礼物栏"><input id="extool__hidegiftbar" type="checkbox">隐藏礼物栏</label>';
    b.insertBefore(a, b.childNodes[0] || null);
}

function getFullScreen() {
    const el = document.getElementById("extool__fullscreen");
    return el ? el.checked : false;
}

function ExpandTool_FullScreen_insertFunc() {
    const el = document.getElementById("extool__fullscreen");
    if (!el) return;
    el.addEventListener("click", function() {
        saveData_FullScreen();
        if (getFullScreen()) {
            showMessage("已开启自动网页全屏", "success");
            fullScreen();
        }
    });
}

function saveData_FullScreen() {
	let data = {
		isFullScreen: getFullScreen()
	};
	localStorage.setItem("ExSave_FullScreen", JSON.stringify(data));
}

function initPkg_ExpandTool_FullScreen_Set() {
	let ret = localStorage.getItem("ExSave_FullScreen");
	if (ret != null) {
		try {
			let retJson = JSON.parse(ret);
			const el = document.getElementById("extool__fullscreen");
			if (el && retJson.isFullScreen) {
				el.checked = !!retJson.isFullScreen;
			}
		} catch (e) {}
	}
}

function ExpandTool_HideGiftBar_insertFunc() {
    const el = document.getElementById("extool__hidegiftbar");
    if (!el) return;
    el.addEventListener("change", function() {
        const hidden = !!el.checked;
        if (typeof setRefreshVideoHidden === "function") {
            setRefreshVideoHidden(hidden, { animate: false });
        } else {
            if (document.body) document.body.classList.toggle("ex-hide-gift-bar", hidden);
            if (document.documentElement) document.documentElement.classList.toggle("ex-hide-gift-bar", hidden);
        }
    });
}

function initPkg_ExpandTool_HideGiftBar_Set() {
    const el = document.getElementById("extool__hidegiftbar");
    if (!el) return;
    if (typeof refresh_Video_getStatus === "function" && refresh_Video_getStatus()) {
        el.checked = true;
        return;
    }
    let ret = localStorage.getItem("ExSave_Refresh");
    if (ret != null) {
        try {
            let retJson = JSON.parse(ret);
            if (retJson && retJson.video && retJson.video.status === true) {
                el.checked = true;
            }
        } catch (e) {}
    }
}

function isWebFullscreenActive() {
    if (document.body && (document.body.classList.contains("is-fullScreen") || document.body.classList.contains("is-fullScreenPage"))) {
        return true;
    }
    if (document.querySelector('.wfs-2a8e83[class*="removed-"]')) {
        return true;
    }
    if (document.querySelector('#js-player-controlbar [class*="right-"] path[d*="M26 19h-6v6"], #js-player-controlbar [class*="right-"] path[d*="M8 13h6V7"]')) {
        return true;
    }
    return false;
}

function findWebFullscreenBtn() {
    const rightGroup = document.querySelector('#js-player-controlbar [class*="right-"], .right-17e251, .right-e7ea5d');

    // Tier 1: Live-Next SVG path match inside controlbar right group
    if (rightGroup) {
        const pathEl = rightGroup.querySelector('path[d*="M20 25h6v-6"], path[d*="M14 7H8v6"]');
        if (pathEl) {
            const btn = pathEl.closest('i, button, [role="button"], div');
            if (btn && rightGroup.contains(btn)) {
                return btn;
            }
        }

        // Tier 2: Tooltip / title / aria-label match inside right group
        const candidates = rightGroup.querySelectorAll('i, button, div');
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            const label = (el.getAttribute("title") || el.getAttribute("aria-label") || "").trim();
            const tip = el.querySelector('[class*="tooltip-"]');
            const tipText = tip ? (tip.textContent || "").trim() : "";
            const text = label || tipText;
            if (text.includes("网页全屏") && !text.includes("退出")) {
                return el;
            }
        }
    }

    // Tier 3: Classic layout fallback
    const classicBtn = document.querySelector('div.wfs-2a8e83:not([class*="removed-"]), .wfs-2a8e83:not([class*="removed-"]), #js-player-controlbar [title="网页全屏"]');
    if (classicBtn) {
        return classicBtn;
    }

    // Tier 4: Guarded structural fallback (only when rightGroup is hydrated with rate control & >= 3 direct icons)
    if (rightGroup && rightGroup.querySelector('[class*="rate-"]')) {
        const directIcons = Array.from(rightGroup.children).filter((child) => {
            return child.tagName === "I" && typeof child.className === "string" && child.className.includes("icon-");
        });
        if (directIcons.length >= 3) {
            return directIcons[directIcons.length - 2];
        }
    }

    return null;
}

function initFullScreen() {
	let ret = localStorage.getItem("ExSave_FullScreen");
	if (ret != null) {
		try {
			let retJson = JSON.parse(ret);
			if (retJson.isFullScreen) {
				fullScreen();
			}
		} catch (e) {}
	}
}

function fullScreen() {
    if (exFullScreenTimer) {
        clearInterval(exFullScreenTimer);
        exFullScreenTimer = null;
    }
    if (isWebFullscreenActive()) {
        return;
    }
    let count = 0;
    const maxPolls = 40; // 20s max
    exFullScreenTimer = setInterval(() => {
        count++;
        if (isWebFullscreenActive()) {
            clearInterval(exFullScreenTimer);
            exFullScreenTimer = null;
            return;
        }
        const btn = findWebFullscreenBtn();
        if (btn) {
            clearInterval(exFullScreenTimer);
            exFullScreenTimer = null;
            if (!isWebFullscreenActive()) {
                btn.click();
            }
            return;
        }
        if (count >= maxPolls) {
            clearInterval(exFullScreenTimer);
            exFullScreenTimer = null;
        }
    }, 500);
}

function getHighestVideoQuality() {
    const el = document.getElementById("extool__highestvideoquality");
    return el ? el.checked : false;
}

function ExpandTool_HighestVideoQuality_insertFunc() {
    const el = document.getElementById("extool__highestvideoquality");
    if (!el) return;
    el.addEventListener("click", function() {
        saveData_HighestVideoQuality();
        if (getHighestVideoQuality()) {
            showMessage("已开启自动最高画质", "success");
            highestVideoQuality();
        }
    });
}

function saveData_HighestVideoQuality() {
	let data = {
		isHighestVideoQuality: getHighestVideoQuality()
	};
	localStorage.setItem("ExSave_HighestVideoQuality", JSON.stringify(data));
}

function initPkg_ExpandTool_HighestVideoQuality_Set() {
	let ret = localStorage.getItem("ExSave_HighestVideoQuality");
	if (ret != null) {
		try {
			let retJson = JSON.parse(ret);
			const el = document.getElementById("extool__highestvideoquality");
			if (el && retJson.isHighestVideoQuality) {
				el.checked = !!retJson.isHighestVideoQuality;
			}
		} catch (e) {}
	}
}

function getQualityContainer() {
    const controlbar = document.getElementById("js-player-controlbar");
    const scopes = controlbar ? [controlbar, document] : [document];
    for (let s = 0; s < scopes.length; s++) {
        const root = scopes[s];
        const qualityInput = root.querySelector('input[value^="画质"], input[value*="画质"]');
        if (qualityInput) {
            const container = qualityInput.closest('[class*="tipItem-"], [class*="tip-"]') || qualityInput.parentElement;
            if (container && container.querySelector("ul > li")) {
                return container;
            }
        }
        try {
            const byHas = root.querySelector('[class*="rate-"] [class*="tipItem-"]:has(input[value*="画质"]), [class*="tipItem-"]:has([value^="画质"]), [class*="tip-"]:has([value^="画质"])');
            if (byHas && byHas.querySelector("ul > li")) {
                return byHas;
            }
        } catch (e) {}
    }
    return document.querySelector('.tipItem-898596, .tip-e3420a');
}

function getQualityItems() {
    const container = getQualityContainer();
    if (!container) return [];
    return Array.from(container.querySelectorAll("ul > li"));
}

function isQualityItemSelected(item) {
    return !!(item && typeof item.className === "string" && item.className.includes("selected"));
}

function isQualityItemDisabled(item) {
    if (!item) return true;
    const cls = typeof item.className === "string" ? item.className : "";
    return item.hasAttribute("disabled") || cls.includes("is-lock") || cls.includes("disabled");
}

function getCurrentQualityLabel() {
    const labelEl = document.querySelector('#js-player-controlbar [class*="rate-"] [class*="textLabel-"], [class*="rate-"] [class*="textLabel-"]');
    if (labelEl && labelEl.textContent) {
        return labelEl.textContent.trim();
    }
    const items = getQualityItems();
    const selected = items.find(isQualityItemSelected);
    return selected && selected.textContent ? selected.textContent.trim() : "";
}

function initHighestVideoQuality() {
	let ret = localStorage.getItem("ExSave_HighestVideoQuality");
	if (ret != null) {
		try {
			let retJson = JSON.parse(ret);
			if (retJson.isHighestVideoQuality) {
				highestVideoQuality();
			}
		} catch (e) {}
	}
}

function highestVideoQuality() {
    if (exHighestQualityTimer) {
        clearInterval(exHighestQualityTimer);
        exHighestQualityTimer = null;
    }
    const runId = ++exHighestQualityRunId;
    let count = 0;
    const maxPolls = 40; // 20s max
    let pokedRate = false;

    exHighestQualityTimer = setInterval(() => {
        if (runId !== exHighestQualityRunId) {
            clearInterval(exHighestQualityTimer);
            exHighestQualityTimer = null;
            return;
        }
        count++;
        const items = getQualityItems();
        if (items.length === 0) {
            // Wake lazy hover menu if rate trigger is mounted
            const rateEl = document.querySelector('#js-player-controlbar [class*="rate-"], [class*="rate-"]');
            if (rateEl && (!pokedRate || count % 4 === 0)) {
                pokedRate = true;
                try {
                    rateEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
                    rateEl.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
                } catch (e) {}
            }
            if (count >= maxPolls) {
                clearInterval(exHighestQualityTimer);
                exHighestQualityTimer = null;
            }
            return;
        }

        clearInterval(exHighestQualityTimer);
        exHighestQualityTimer = null;

        const maxAttempts = Math.min(items.length, 4);
        let attempts = 0;

        function trySelectIndex(targetIdx) {
            if (runId !== exHighestQualityRunId) return;
            const liveItems = getQualityItems();
            if (liveItems.length === 0 || targetIdx >= liveItems.length || attempts >= maxAttempts) {
                return;
            }

            const currentSelectedIdx = liveItems.findIndex(isQualityItemSelected);
            // Already at or above the candidate quality
            if (currentSelectedIdx >= 0 && currentSelectedIdx <= targetIdx) {
                return;
            }

            const targetItem = liveItems[targetIdx];
            if (!targetItem || isQualityItemDisabled(targetItem)) {
                trySelectIndex(targetIdx + 1);
                return;
            }

            const targetText = (targetItem.textContent || "").trim();
            attempts++;
            targetItem.click();

            // Verify after ~1.8s whether Douyu kept the switch or reverted (e.g. logged-out cap)
            setTimeout(() => {
                if (runId !== exHighestQualityRunId) return;
                const freshItems = getQualityItems();
                const freshSelectedIdx = freshItems.findIndex(isQualityItemSelected);
                const freshLabel = getCurrentQualityLabel();
                const stuck =
                    (freshSelectedIdx >= 0 && freshSelectedIdx <= targetIdx) ||
                    (freshLabel && targetText && freshLabel === targetText);
                if (!stuck) {
                    trySelectIndex(targetIdx + 1);
                }
            }, 1800);
        }

        trySelectIndex(0);
    }, 500);
}