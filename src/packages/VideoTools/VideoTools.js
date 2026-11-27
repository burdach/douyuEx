var liveVideoNode; // 直播video标签节点
var isInput = false;
let videotools_num = 0;
let VideoTools_contextMenuCallbacks = [];
let VideoTools_contextMenuObserver = null;
let VideoTools_contextMenuTarget = null;

function VideoTools_getVideoNode() {
    if (liveVideoNode && liveVideoNode.isConnected) {
        return liveVideoNode;
    }
    liveVideoNode = document.querySelector(".layout-Player-videoEntity video, #__video2, #__video_container video, #__h5player video");
    return liveVideoNode;
}

function VideoTools_getControlbarRight() {
    return getValidDom([".right-17e251", ".right-e7ea5d", '#js-player-controlbar [class*="right-"]']);
}

function VideoTools_getControlbarLeft() {
    return getValidDom([".left-bfab3b", ".left-d3671e", '#js-player-controlbar [class*="left-"]']);
}

function VideoTools_findContextMenu(root) {
    const scope = root || document;
    return scope.querySelector('ul.menu-da2a9e, #__video_container ul[class*="menu-"], #__h5player ul[class*="menu-"]');
}

function VideoTools_applyContextMenuCallbacks(menu) {
    if (!menu) return;
    for (let i = 0; i < VideoTools_contextMenuCallbacks.length; i++) {
        const entry = VideoTools_contextMenuCallbacks[i];
        const attr = `data-ex-cm-${entry.key}`;
        if (menu.getAttribute(attr) === "1") {
            continue;
        }
        try {
            const result = entry.callback(menu);
            if (result !== false) {
                menu.setAttribute(attr, "1");
            }
        } catch (e) {
            console.warn(`[DouyuEx] ContextMenu "${entry.key}" failed:`, e);
        }
    }
}

function VideoTools_ensureContextMenuObserver() {
    if (VideoTools_contextMenuObserver && VideoTools_contextMenuTarget && VideoTools_contextMenuTarget.isConnected) {
        return;
    }
    if (VideoTools_contextMenuObserver) {
        try { VideoTools_contextMenuObserver.disconnect(); } catch (e) {}
        VideoTools_contextMenuObserver = null;
        VideoTools_contextMenuTarget = null;
    }
    const container = getValidDom(["#__video_container", ".room-Player-Box", "#__h5player", "#js-player-video", ".layout-Player-videoEntity"]) || document.body;
    if (!container) {
        return;
    }
    VideoTools_contextMenuTarget = container;
    VideoTools_contextMenuObserver = new MutationObserver((mutations) => {
        let foundMenu = null;
        for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes;
            for (let j = 0; j < added.length; j++) {
                const node = added[j];
                if (!node || node.nodeType !== 1) continue;
                if (node.matches && (node.matches("ul.menu-da2a9e") || node.matches('ul[class*="menu-"]'))) {
                    foundMenu = node;
                    break;
                }
                if (node.querySelector) {
                    const inner = node.querySelector('ul.menu-da2a9e, ul[class*="menu-"]');
                    if (inner) {
                        foundMenu = inner;
                        break;
                    }
                }
            }
            if (foundMenu) break;
        }
        if (foundMenu) {
            VideoTools_applyContextMenuCallbacks(foundMenu);
        }
    });
    VideoTools_contextMenuObserver.observe(container, { childList: true, subtree: true });
}

function VideoTools_registerContextMenu(key, callback) {
    if (typeof key === "function") {
        callback = key;
        key = "cb_" + VideoTools_contextMenuCallbacks.length;
    }
    if (typeof callback !== "function") {
        return;
    }
    const existingIdx = VideoTools_contextMenuCallbacks.findIndex((item) => item.key === key);
    if (existingIdx >= 0) {
        VideoTools_contextMenuCallbacks[existingIdx].callback = callback;
    } else {
        VideoTools_contextMenuCallbacks.push({ key, callback });
    }
    VideoTools_ensureContextMenuObserver();
    const existingMenu = VideoTools_findContextMenu();
    if (existingMenu) {
        VideoTools_applyContextMenuCallbacks(existingMenu);
    }
}

function initPkg_VideoTools() {
    let timer = setInterval(() => {
        const controlbar = VideoTools_getControlbarRight();
        if (controlbar) {
            clearInterval(timer);
            liveVideoNode = VideoTools_getVideoNode();
            VideoTools_registerContextMenu("version", (menu) => {
                const disableItem = menu.querySelector('.disable-23f484, li[class*="disable-"]');
                if (disableItem) {
                    const ver = typeof curVersion !== "undefined" ? curVersion : "";
                    disableItem.textContent = `DouyuEx_${ver}`;
                }
            });
            initPkg_VideoTools_Module();
            initPkg_VideoTools_Func();
            return;
        }
        videotools_num++;
        if (videotools_num >= 50) {
            clearInterval(timer);
        }
    }, 800);
}

function initPkg_VideoTools_Module() {
    const modules = [
        ["VideoToolbarMenu", initPkg_VideoTools_VideoToolbarMenu],
        ["Joysound", initPkg_VideoTools_Joysound],
        ["VideoSpeed", initPkg_VideoTools_VideoSpeed],
        ["Cinema", initPkg_VideoTools_Cinema],
        ["VideoSync", initPkg_VideoTools_VideoSync],
        ["VideoRecall", initPkg_VideoTools_VideoRecall],
        ["Filter", initPkg_VideoTools_Filter],
        ["Camera", initPkg_VideoTools_Camera],
        ["VideoZoom", initPkg_VideoTools_VideoZoom],
        ["MetaData", initPkg_VideoTools_MetaData],
        ["PictureInPictureControl", initPkg_PictureInPictureControl],
    ];
    for (const [name, fn] of modules) {
        try {
            if (typeof fn === "function") {
                fn();
            }
        } catch (e) {
            console.warn(`[DouyuEx] VideoTools module "${name}" init failed:`, e);
        }
    }
}

function initPkg_VideoTools_Func() {
    const hideFilterOnLeave = () => {
        if (typeof VideoToolbarMenu_hideFilterPanel === "function") {
            VideoToolbarMenu_hideFilterPanel();
        } else if (typeof Filter_hidePanel === "function") {
            Filter_hidePanel();
        }
    };
    const playerToolbar = document.getElementById("js-player-toolbar");
    if (playerToolbar) {
        playerToolbar.addEventListener("mouseover", hideFilterOnLeave);
    }
    const asideMain = document.getElementById("js-player-asideMain");
    if (asideMain) {
        asideMain.addEventListener("mouseover", hideFilterOnLeave);
    }
    const inputDom = getValidDom([".inputView-2a65aa", ".inputView-620ab7", ".ChatSend-txt", '[class*="inputView-"]']);
    if (inputDom) {
        inputDom.addEventListener("focus", () => {
            isInput = true;
        });
        inputDom.addEventListener("blur", () => {
            isInput = false;
        });
    }
    if (document.querySelector(".app-f0f9c7")) {
        new DomHook(".app-f0f9c7", false, (m) => {
            if (m.length > 0) {
                if (m[0].addedNodes.length > 0) {
                    isInput = true;
                } else if (m[0].removedNodes.length > 0) {
                    isInput = false;
                }
            }
        });
    }
}
