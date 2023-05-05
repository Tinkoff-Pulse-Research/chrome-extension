function detect_slang(text, callback) {
    fetch("https://tinkoff.dan.tatar/detect_slang", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text }),
        cache: "reload",
    }).then(response => response.json()).then(data => {
        res = data.result.highlight;
        text = text.split(/\s/gm);
        Object.entries(data.result.highlight).forEach(([key, value]) => {
            var index = key.split("_")[0];
            var model = key.split("_")[1];
            if (model == "determined2") {
                model = "determined";
                var index = key.split("_")[0];
                var left = parseInt(index.split(":")[0]);
                var right = parseInt(index.split(":")[1]);
                text[left] = `<span class="slang ${model}" aria-title="${value || "нет определения 😔"}">${text[left]}`;
                text[right] = `${text[right]}</span>`;
            } else {
                word = text[parseInt(index)];
                text[parseInt(index)] = `<span class="slang ${model}" aria-title="${value || "нет определения 😔"}">${word}</span>`;
            }
        });
        callback(text.join(" "));
        document.querySelectorAll(".slang").forEach((elem) => {
            elem.onmouseover = (e) => {
                var r = e.target.getBoundingClientRect();
                var box = document.querySelector(".tooltip");
                box.style.marginTop = `${r.y + 10 + r.height}px`;
                if (window.innerWidth > 736) {
                    box.style.marginLeft = `${r.x + 10}px`;
                } else {
                    if (r.x + 10 > window.innerWidth * 0.3) {
                        box.style.marginLeft = `${Math.round(window.innerWidth * 0.3)}px`;
                    } else {
                        box.style.marginLeft = `${r.x + 10}px`;
                    }
                }
                box.innerText = elem.getAttribute("aria-title");
                box.style.opacity = "1";
            }

            elem.onmouseout = () => {
                var box = document.querySelector(".tooltip");
                box.style.opacity = "0";
            }
        });
    });
}


const process = () => {
    var cont = document.querySelector("div[data-qa-tag='PulseCommentsContainer']");
    cont.querySelectorAll("div").forEach((div) => {
        if (div.classList.contains("processed_ml")) return;
        var classes = div.classList;
        for (var i = 0; i < classes.length; i++) {
            var className = classes[i];
            if (className.startsWith("PulseComment__commentText")) {
                div.parentNode.classList.add("processing");
                div.classList.add("processed_ml");
                detect_slang(div.innerText, (answer) => { div.innerHTML = answer; div.parentNode.classList.remove("processing"); });
            }
        }
    });
    setTimeout(process, 1000);
}

process();

var tooltip = document.createElement("div");
tooltip.classList.add("tooltip");
document.body.appendChild(tooltip);


