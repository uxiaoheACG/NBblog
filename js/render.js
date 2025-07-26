function loadBlog(path) {
    fetch(path)
        .then(res => res.text())
        .then(md => {
            const html = marked.parse(md);
            document.getElementById("content").innerHTML = html;
        })
        .catch(err => {
            document.getElementById("content").innerHTML = "<p>加载失败！</p >";
            console.error(err);
        });
}