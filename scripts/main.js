function go_to_blog(id) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("id", id);
  window.location.search = urlParams;
}
async function fetch_json() {
  return fetch(`collection/articles.json`)
    .then((res) => res.json())
    .then((json) => {
      return json;
    })
    .catch((e) => console.error(e));
}

async function main_behavior() {
  // TODO: Handle bad IDs
  // We need title if we are rendering a page, if not we need to show the links
  var blog_json = await fetch_json();

  url = new URL(window.location.href);
  if (url.searchParams.has("id")) {
    document.getElementById("link_container").remove();
    var id = new URLSearchParams(window.location.search).get("id");
    if (!blog_json[id]) {
      fetch_location = "collection/responses/bad_page.md";
      document.title = "Invaild ID";
    } else {
      fetch_location = `collection/${id}/markup.md`;
      document.title = blog_json[id];
    }
    var converter = new showdown.Converter();
    converter.setOption("ghCodeBlocks", true);
    converter.setFlavor("github");

    fetch(fetch_location)
      .then((res) => res.text())
      .then((text) => {
        var html = converter.makeHtml(text);
        document
          .getElementById("blog_container")
          .insertAdjacentHTML("beforeend", html);
        hljs.highlightAll();
      })
      .catch((e) => console.error(e));
    return;
  }
  // If not looking at blog

  // We are putting it here instead of inside the HTML file because
  // it is used for both the blog and the blog listing meaning it will
  // display for a split second before rendering the blog if not here.
  var title = "<h1>Blogs</h1><br>";
  document.getElementById("link_container").innerHTML += title;
  for (const link in blog_json) {
    var html = `<a href="javascript:void(0);" onClick="go_to_blog(${link})">${blog_json[link]}</a> <br>`;
    document.getElementById("link_container").innerHTML += html;
  }
}
main_behavior();
