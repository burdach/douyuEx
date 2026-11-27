/*
    Style Hook
    用于替换页面的原样式
    By 小淳
*/
function StyleHook_set(styleName, styleText) {
    // styleName：样式id名，建议以Ex_Style_大驼峰的形式命名
    if (document.getElementById(styleName) == null) {
        const target = document.head || document.documentElement || document.body;
        if (!target) {
            return;
        }
        let styleElement = document.createElement("style");
        styleElement.id = styleName;
        styleElement.textContent = styleText;
        target.appendChild(styleElement);
    }
}

function StyleHook_remove(styleName) {
    let e = document.getElementById(styleName);
    if (e !== null) {
        e.remove();
    }
}

function StyleHook_setIframe(dom, styleName, styleText) {
    // styleName：样式id名，建议以Ex_Style_大驼峰的形式命名
    // document.getElementsByClassName("BottomGroup")[0].getElementsByTagName("iframe")[0].contentWindow.document
    if (!dom) {
        return;
    }
    if (dom.getElementById(styleName) == null) {
        const target = dom.head || dom.documentElement || dom.body;
        if (!target) {
            return;
        }
        let styleElement = dom.createElement("style");
        styleElement.id = styleName;
        styleElement.textContent = styleText;
        target.appendChild(styleElement);
    }
}

function StyleHook_removeIframe(dom, styleName) {
    if (!dom) {
        return;
    }
    let e = dom.getElementById(styleName);
    if (e !== null) {
        e.remove();
    }
}
