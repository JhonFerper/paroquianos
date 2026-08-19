(function () {
  "use strict";
  var list = document.getElementById("eventList");
  EVENTS.forEach(function (event) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "event-card";
    a.href = event.id === "semana-da-familia-2026" ? "index.html" : "galeria.html?evento=" + encodeURIComponent(event.id);
    a.innerHTML = "<span class=\"event-card__year\">" + event.year + "</span><span class=\"event-card__title\">" + event.title + "</span><span class=\"event-card__meta\">" + event.photoCount + " fotografias · acessar galeria</span>";
    li.appendChild(a); list.appendChild(li);
  });
})();
