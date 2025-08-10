function addPrefixToPath(path) {
    if (path.startsWith('http')) {
        // 网络路径不处理
        return path;
    } else if (path.startsWith('/imgs/')) {
        // 以 /imgs/ 开头的路径加前缀
        return '/NBblog' + path;
    } else if (!path.startsWith('/')) {
        // 纯相对路径也加前缀
        return '/NBblog/' + path;
    } else {
        // 其他以 / 开头但不是 /imgs/ 的路径不改
        return path;
    }
}

function loadBlog(path) {
    fetch(path)
        .then(res => res.text())
        .then(md => {
            // 替换 Markdown 图片语法路径
            let fixedMd = md.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
                url = addPrefixToPath(url);
                return `![${alt}](${url})`;
            });

            // 替换 HTML <img> 标签 src 路径
            fixedMd = fixedMd.replace(/<img\s+([^>]*?)src="(.*?)"(.*?)>/g, (match, beforeSrc, src, afterSrc) => {
                src = addPrefixToPath(src);
                return `<img ${beforeSrc}src="${src}"${afterSrc}>`;
            });

            const html = marked.parse(fixedMd);
            document.getElementById("content").innerHTML = html;
        })
        .catch(err => {
            document.getElementById("content").innerHTML = "<p>加载失败！</p>";
            console.error(err);
        });
}
