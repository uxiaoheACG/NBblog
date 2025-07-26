function loadBlog(path) {
    fetch(path)
        .then(res => res.text())
        .then(md => {
            // 替换 Markdown 中图片路径，给相对路径加仓库名前缀
            const fixedMd = md.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
                if (!url.startsWith('http') && !url.startsWith('/')) {
                    url = '/NBblog/' + url; // 这里替换成你的仓库名
                }
                return `![${alt}](${url})`;
            });

            const html = marked.parse(fixedMd);
            document.getElementById("content").innerHTML = html;
        })
        .catch(err => {
            document.getElementById("content").innerHTML = "<p>加载失败！</p>";
            console.error(err);
        });
}
