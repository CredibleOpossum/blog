function go_to_blog(id) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('id', id);
    window.location.search = urlParams;
}
async function fetch_json() {
    return fetch(`collection/articles.json`)
        .then((res) => res.json())
        .then(json => {
            return json;
        })
        .catch((e) => console.error(e))
}

async function main_behavior() {
    // TODO: Handle bad IDs
    var blog_json = await fetch_json() // We need title if we are rendering a page, if not we need to show the links

    url = new URL(window.location.href);
    if (url.searchParams.has('id')) {
        var id = new URLSearchParams(window.location.search).get("id");
        document.title = blog_json[id];
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
        return;
    }

    for (const link in blog_json) {
        var html = `<a href="javascript:void(0);" onClick="go_to_blog(${link})">${blog_json[link]}</a> <br>`
        document.getElementById("link_container").innerHTML += html;
    }

}
main_behavior();
