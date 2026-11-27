function initPkg_VideoTools_VideoSpeed() {
    initPkg_VideoTools_VideoSpeed_Dom();
}

function initPkg_VideoTools_VideoSpeed_Dom() {
    VideoTools_registerContextMenu("videospeed", (menu) => {
        if (menu.querySelector("#ex-videospeed")) {
            return;
        }
        let a = document.createElement("li");
        a.id = "ex-videospeed";
        a.innerHTML = `
        倍速播放
        <ul class="videospeed__wrap">
            <li id="videospeed__2.0" data-rate="2">2.0x</li>
            <li id="videospeed__1.5" data-rate="1.5">1.5x</li>
            <li id="videospeed__1.25" data-rate="1.25">1.25x</li>
            <li id="videospeed__1.0" data-rate="1">1.0x</li>
            <li id="videospeed__0.75" data-rate="0.75">0.75x</li>
            <li id="videospeed__0.5" data-rate="0.5">0.5x</li>
        </ul>
        `;
        menu.insertBefore(a, menu.childNodes[1] || null);
        a.querySelectorAll("li[data-rate]").forEach((item) => {
            item.addEventListener("click", () => {
                const video = VideoTools_getVideoNode();
                if (video) {
                    video.playbackRate = Number(item.getAttribute("data-rate")) || 1;
                }
            });
        });
    });
}
