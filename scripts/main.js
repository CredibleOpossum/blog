function go_to_blog(id) {
    var converter = new showdown.Converter();
    converter.setOption("ghCodeBlocks", true)
    converter.setFlavor('github');
    fetch(`collection/${id}/markup`)
        .then((res) => res.text())
        .then((text) => {
            document.getElementById("link_container").remove();
            var html = converter.makeHtml(text);
            document.getElementById('blog_container').insertAdjacentHTML('beforeend', html);
            hljs.highlightAll();
        })
        .catch((e) => console.error(e))
}
fetch(`collection/articles.json`)
    .then((res) => res.text())
    .then((text) => {
        var blogs = JSON.parse(text);
        for (const link in blogs) {
            var html = `<a href="javascript:void(0);" onClick="go_to_blog(${blogs[link]})">${link}</a> <br>`
            document.getElementById("link_container").innerHTML += html;
        }
    })
    .catch((e) => console.error(e))
