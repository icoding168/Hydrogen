(function () {

    isZhihuPage = window.location.hostname.includes('zhihu.com');
    isLocalPage = window.location.href.startsWith("file://");


    const match = window.location.pathname.match(/\/appview\/(.*?)\//);
    AppViewType = match ? match[1] : null;

    function getImgs() {
        return document.querySelectorAll("img")
    }

    function isImageIsEnabled() {
        return true
    }

    if (isZhihuPage && AppViewType) {

        switch (AppViewType) {
            case "pin":
                getImgs = function () {
                    return document.querySelectorAll(".pin-header-image")
                }
                isImageIsEnabled = function (doc) {
                    return document.querySelector(".css-0").contains(doc)
                }
                break
            case "answer": case "p":
                getImgs = function () {
                    return document.querySelector(".RichText").querySelectorAll("img")
                }
                isImageIsEnabled = function (doc) {
                    return document.querySelector(".RichText").contains(doc)
                }
                break
        }
    }

    function getSrc(doc) {
        if (isLocalPage) return doc.src
        return doc.dataset && (doc.dataset.original || doc.dataset.src) || doc.src;
    }

    function replaceSrcWithGif(src) {
        return src.replace(/(\.\w+)(\?.*)?$/, ".gif$2");
    }

    function getImageIndexAndSrc(eleSrc) {
        const images = getImgs();
        const imageInfo = {};

        for (let index = 0; index < images.length; index++) {
            let src = getSrc(images[index]);

            if (isZhihuPage && images[index].parentNode.className.includes("GifPlayer")) {
                src = replaceSrcWithGif(src);
            }

            imageInfo[index] = src;

            if (images[index].src === eleSrc) {
                imageInfo[images.length] = index;
            }
        }

        return imageInfo;
    }


    function checkClickTarget(event) {
        let target = event.target;

        if (target.tagName.toLowerCase() === 'div') {
            while (target && target.tagName.toLowerCase() !== 'body') {
                const parent = target.parentElement;

                if (parent && Math.abs(target.clientWidth - parent.clientWidth) <= 5 &&
                    Math.abs(target.clientHeight - parent.clientHeight) <= 5) {

                    const img = parent.querySelector('img:first-child');
                    if (img) {
                        return img;
                    }
                } else {
                    break;
                }

                target = target.parentElement;
            }
        }
        return event.target;
    }

    document.addEventListener('click', function (event) { // 判断点击的目标是否为img元素 
        let doc = event.target

        if (isZhihuPage) {
            if (isImageIsEnabled(doc) == false) return
            if (doc.parentNode.className.includes("GifPlayer")) {
                // 禁止父元素接受事件
                doc.parentNode.style.pointerEvents = "none"
                doc.src = replaceSrcWithGif(doc.src);
                doc.dataset.original = doc.src;
                event.stopPropagation()
                let children = doc.parentNode.children
                for (var i = 0; i < children.length; i++) {
                    if (children[i].tagName != "IMG") {
                        children[i].style.display = "none"
                        children[i].style.pointerEvents = "none"
                    }
                }
                return false
            }
        }
        if (doc.tagName !== 'IMG') {
            doc = checkClickTarget(event)
        }
        if (doc.tagName === 'IMG') {
            window.androlua.execute(JSON.stringify(getImageIndexAndSrc(doc.src)));
        }
    }, true);

})();