function loadBlog(path) {
    fetch(path)
        .then(res => res.text())
        .then(md => {
            // 给 Markdown 中的相对图片路径加上仓库名前缀 /NBblog/
            const fixedMd = md.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
                if (!url.startsWith('http') && !url.startsWith('/')) {
                    url = '/NBblog/' + url;
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

