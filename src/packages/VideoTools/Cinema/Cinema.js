function initPkg_VideoTools_Cinema() {
    initPkg_VideoTools_Cinema_Dom();
}

function initPkg_VideoTools_Cinema_Dom() {
    VideoTools_registerContextMenu("cinema", (menu) => {
        if (menu.querySelector("#ex-cinema")) {
            return;
        }
        let a = document.createElement("li");
        a.id = "ex-cinema";
        a.innerHTML = `
        影院比例
        <ul class="cinema__wrap">
            <li id="cinema__default">默认</li>
            <li id="cinema__cover">剪裁</li>
            <li id="cinema__fill">拉伸</li>
        </ul>
        `;
        menu.insertBefore(a, menu.childNodes[1] || null);
        const btnDefault = a.querySelector("#cinema__default");
        const btnCover = a.querySelector("#cinema__cover");
        const btnFill = a.querySelector("#cinema__fill");
        if (btnDefault) {
            btnDefault.addEventListener("click", () => {
                StyleHook_remove("Ex_Style_Cinema");
            });
        }
        if (btnCover) {
            btnCover.addEventListener("click", () => {
                setVideoCinemaMode("cover");
            });
        }
        if (btnFill) {
            btnFill.addEventListener("click", () => {
                setVideoCinemaMode("fill");
            });
        }
    });
}

function setVideoCinemaMode(fit) {
    const video = VideoTools_getVideoNode();
    if (!video) return;
    const width = video.getBoundingClientRect().width || parseInt(video.style.width, 10) || video.clientWidth;
    if (!width) return;
    let newHeight = String(Math.round(width / 2.39)) + "px";
    StyleHook_remove("Ex_Style_Cinema");
    let style = `
    .layout-Player-videoEntity video, #__video2 {object-fit:${ fit } !important;height:${ newHeight } !important;}
    `;
    StyleHook_set("Ex_Style_Cinema", style);
}