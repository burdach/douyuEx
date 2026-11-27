function initPkg_ExpandTool_P2P() {
    ExpandTool_P2P_insertDom();
    ExpandTool_P2P_insertFunc();
    initPkg_ExpandTool_P2P_Set();
}

function ExpandTool_P2P_insertDom() {
    let b = document.getElementsByClassName("extool")[0];
    if (!b || document.getElementById("extool__p2p")) return;
    let a = document.createElement("span");
    a.innerHTML = '<label title="阻止p2p在后台占用网速，开启后直播画面会在刚进入页面时卡一下"><input id="extool__p2p" type="checkbox">阻止p2p上传</label>';
    b.insertBefore(a, b.childNodes[0] || null);
}


function getP2P() {
    const el = document.getElementById("extool__p2p");
    return el ? el.checked : false;
}
function ExpandTool_P2P_insertFunc() {
    const el = document.getElementById("extool__p2p");
    if (!el) return;
    el.addEventListener("click", function() {
        saveData_P2P();
        if (getP2P()) {
            showMessage("阻止p2p上传成功，刷新页面生效", "success");
        }
    });
}

function saveData_P2P() {
	let data = {
		isKillP2P: getP2P()
	};
	localStorage.setItem("ExSave_P2P", JSON.stringify(data));
}
function initPkg_ExpandTool_P2P_Set() {
	let ret = localStorage.getItem("ExSave_P2P");
	if (ret != null) {
		try {
			let retJson = JSON.parse(ret);
			const el = document.getElementById("extool__p2p");
			if (el && retJson.isKillP2P) {
				el.checked = !!retJson.isKillP2P;
			}
		} catch (e) {}
	}
}


function initKillP2P() {
	let ret = localStorage.getItem("ExSave_P2P");
	if (ret != null) {
		try {
			let retJson = JSON.parse(ret);
			if (retJson.isKillP2P) {
				killP2P();
			}
		} catch (e) {}
	}
}

function killP2P() {
    let funNameList = [
        'RTCPeerConnection',
        'webkitRTCPeerConnection',
        'mozRTCPeerConnection',
        'msRTCPeerConnection',
    ];
    funNameList.forEach(name => {
        if (typeof unsafeWindow.RTCPeerConnection === "undefined") unsafeWindow.RTCPeerConnection = unsafeWindow[name];
        if (typeof unsafeWindow[name] !== "undefined") unsafeWindow[name] = MyPeerConnection;
    });

    function MyPeerConnection() {
        return undefined;
    }
}