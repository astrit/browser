document.getElementById("back").addEventListener("click", () => {
  window.api.send("navigate", "http://google.com");
});

document.getElementById("forward").addEventListener("click", () => {
  window.api.send("navigate", "http://github.com");
});

document.getElementById("go").addEventListener("click", () => {
  let url = document.getElementById("url").value;
  if (!url.match(/^[a-zA-Z]+:\/\//)) {
    url = "http://" + url;
  }
  window.api.send("navigate", url);
});
