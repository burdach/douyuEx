function initRouter(href) {
    // 用于优先载入夜间模式
    // if (String(href).indexOf("www.douyu.com") && String(href).indexOf("getFansBadgeList") == -1) {
    //     initPkg_Night_Set_Fast();
    // }

    // 路由转发
    if (String(href).indexOf("yuba.douyu.com") !== -1) {
        // 鱼吧
        if (String(href).indexOf("?exRestore") !== -1) {
            initPkg_RestoreYuba_restore();
        } else if (String(href).indexOf("?exClean") !== -1) {
            initRouter_CleanYuba();
        } else {
            initRouter_Yuba();
        }
    } else if (String(href).indexOf("passport.douyu.com") !== -1 && String(href).indexOf("exid=chun") !== -1) {
        // 账号
        initRouter_Passport();
    } else if (String(href).indexOf("msg.douyu.com") !== -1) {
        // 车队
        if (href.indexOf("?exClean") !== -1) {
            initRouter_CleanMsg();
        } else {
            initRouter_Motorcade();
        }
    } else if (String(href).indexOf("v.douyu.com") !== -1) {
        // 视频
        if (String(href).indexOf("?exClean") !== -1) {
            initRouter_CleanVideo();
        } else if (String(href).indexOf("show/") !== -1) {
            initRouter_Video();
        }
    } else if (String(href).indexOf("cz.douyu.com") !== -1) {
        // 充值
        if (String(href).indexOf("?exClean") !== -1) {
            initRouter_CleanCz();
        }
    } else if (String(href).indexOf("getFansBadgeList") !== -1) {
        // 粉丝牌
        initRouter_FansBadgeList();
    } else {
        if (String(href).indexOf("exid=chun") !== -1) {
            // 主站
            initRouter_DouyuRoom_Popup();
        } else {
            if (String(href).indexOf("template/") !== -1 || String(href).indexOf("h5/") !== -1) {
                return;
            }
            initRouter_DouyuRoom_Main();
        }
    }
}

function initRouter_Motorcade() {
    // 车队
    if (getQueryString("exid") == "chun") {
        signMotorcade_Sign();
    }
}

function initRouter_DouyuRoom_Popup() {
    // 画中画
    safeInit("RemoveAD_Style", removeAD);
    let retryCount = 0;
    const maxRetries = 30;
    let intID = setInterval(() => {
        retryCount++;
        const isAlreadyWfs = document.body && (
            document.body.classList.contains("is-fullScreenPage") ||
            !!document.querySelector(".wfs-2a8e83[class*='removed-']")
        );
        const wfsBtn = isAlreadyWfs ? null : findPopupWebFullscreenBtn();
        if (isAlreadyWfs || wfsBtn) {
            clearInterval(intID);
            if (wfsBtn) {
                try { wfsBtn.click(); } catch (e) {}
            }
            const asideBtn = document.querySelector("label.layout-Player-asidetoggleButton");
            if (asideBtn) {
                try { asideBtn.click(); } catch (e) {}
            }
            const qualityItems = findPopupQualityItems();
            if (qualityItems.length > 0) {
                try { qualityItems[qualityItems.length - 1].click(); } catch (e) {}
            }
            return;
        }
        if (retryCount >= maxRetries) {
            clearInterval(intID);
        }
    }, 1000);
}

function findPopupWebFullscreenBtn() {
    const classicBtn = document.querySelector("div.wfs-2a8e83, [class*='wfs-']");
    if (classicBtn) return classicBtn;
    const bar = document.getElementById("js-player-controlbar");
    if (!bar) return null;
    const rightBar = bar.querySelector('[class*="right-"]');
    const scope = rightBar || bar;
    const labeled = scope.querySelector('[aria-label*="网页全屏"], [title*="网页全屏"]');
    if (labeled) {
        const text = (labeled.getAttribute("aria-label") || labeled.getAttribute("title") || "");
        if (!text.includes("退出网页全屏")) return labeled;
    }
    if (rightBar) {
        const directIcons = Array.from(rightBar.children).filter((el) => el.tagName === "I");
        for (const icon of directIcons) {
            const txt = icon.textContent || "";
            if (txt.includes("网页全屏") && !txt.includes("退出网页全屏")) return icon;
            if (icon.querySelector('path[d*="M20 25h6v-6"], path[d*="M14 7H8v6"]')) return icon;
        }
        if (rightBar.querySelector('[class*="rate-"]') && directIcons.length >= 3) {
            return directIcons[directIcons.length - 2];
        }
    }
    return null;
}

function findPopupQualityItems() {
    const classicItems = document.querySelectorAll(".tip-e3420a > ul > li");
    if (classicItems.length > 0) return classicItems;
    const tipItems = document.querySelectorAll('[class*="tipItem-"]');
    for (const item of tipItems) {
        const input = item.querySelector("input");
        if (input && String(input.value || "").includes("画质")) {
            const lis = item.querySelectorAll("ul > li");
            if (lis.length > 0) return lis;
        }
    }
    return [];
}


function initRouter_DouyuRoom_Main() {
    // 主要
    try {
        document.domain = "douyu.com";
    } catch (e) {}
    init();
    let started = false;
    let retryCount = 0;
    const maxRetries = 30;
    const startMain = () => {
        if (started) return;
        started = true;
        if (!rid && typeof extractRoomId === "function") {
            rid = extractRoomId();
        }
        setTimeout(() => {
            safeInit("initStyles", initStyles);
            safeInit("initPkg", initPkg);
            safeInit("initPkgSpecial", initPkgSpecial);
            safeInit("initTimer", initTimer);
        }, 1500);
    };
    let intID = setInterval(() => {
        retryCount++;
        const hasPrimary = !!(
            document.querySelector(".Barrage-main") ||
            document.querySelector("#js-player-controlbar")
        );
        const hasSecondary = !!(
            document.querySelector("#js-backpack-enter") ||
            document.querySelector(".BackpackButton") ||
            document.querySelector("#js-player-toolbar") ||
            document.querySelector("#__h5player")
        );
        if (hasPrimary && hasSecondary) {
            clearInterval(intID);
            startMain();
            return;
        }
        if (retryCount >= maxRetries) {
            clearInterval(intID);
            const hasPlayerFallback = !!(
                document.querySelector("#__video2") ||
                document.querySelector("#__h5player") ||
                document.querySelector(".room-Player-Box") ||
                document.querySelector("video")
            );
            if (hasPlayerFallback) {
                console.warn("[DouyuEx] Bootstrap landmarks timed out; starting via player fallback.");
                startMain();
            }
        }
    }, 1000);
}

function initPkgSpecial() {
}

// function initRouter_Novel() {
//     startWatchNovel();
// }

function initRouter_Yuba() {
    try {
        document.domain = "douyu.com";
    } catch (e) {}
    RestoreYuba_checkRedirect();
}

function initRouter_Passport() {
    let cmd = getStrMiddle(window.location.href, "cmd=", "&");
    let uid = getStrMiddle(window.location.href, "uid=", "&");
    let domain = getStrMiddle(window.location.href, "domain=", "&");
    if (cmd !== "clean") {
        addAccountPassport(uid);
    }
    switch (cmd) {
        case "clean":
            // 清空cookie，用于重新登录
            cleanCookie(() => {
                window.parent.postMessage("cleanOver", decodeURIComponent(domain));
            });
            break;
        case "switch":
            // 切换用户
            switchAccountPassport(uid, () => {
                window.parent.postMessage("switchOver", decodeURIComponent(domain));
            });
            break;
        case "delete":
            // 删除用户
            deleteAccountPassport(uid, () => {
                window.parent.postMessage("deleteOver", decodeURIComponent(domain));
            });
            break;
        default:
            break;
    }
    return;
}

function initRouter_CleanMsg() {
    let domain = getStrMiddle(window.location.href, "domain=", "&");
    cleanCookie(() => {
        window.parent.postMessage("msgCleanOver", decodeURIComponent(domain));
    });
}

function initRouter_CleanYuba() {
    let domain = getStrMiddle(window.location.href, "domain=", "&");
    cleanCookie(() => {
        window.parent.postMessage("yubaCleanOver", decodeURIComponent(domain));
    });
}

function initRouter_CleanVideo() {
    let domain = getStrMiddle(window.location.href, "domain=", "&");
    cleanCookie(() => {
        window.parent.postMessage("videoCleanOver", decodeURIComponent(domain));
    });
}

function initRouter_CleanCz() {
    let domain = getStrMiddle(window.location.href, "domain=", "&");
    cleanCookie(() => {
        window.parent.postMessage("czCleanOver", decodeURIComponent(domain));
    });
}

function initRouter_Video() {
    if (unsafeWindow.$DATA && "ROOM" in unsafeWindow.$DATA) {
        // 在视频观看页面
        initStyles();
        initPkg_VideoTime();
        initPkg_VideoTools_Camera_Video();
        initPkg_DyVideoDownload();
        initPkg_DyVideoBarrageLine();
    }
}

function initRouter_FansBadgeList() {
    initPkg_FansBadgeList();
}