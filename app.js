if (typeof (String.prototype.trim) === "undefined") {
    String.prototype.trim = function () {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


const detect_slang = (text, callback) => {
    fetch("https://tinkoff.dan.tatar/detect_slang", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text.trim()
        }),
        cache: "reload",
    }).then(response => response.json()).then(data => {
        res = data.result.highlight;
        text = text.trim().split(/\s/gm);
        Object.entries(data.result.highlight).forEach(([key, value]) => {
            let index = key.split("_")[0];
            let model = key.split("_")[1];
            if (model == "determined2") {
                model = "determined";
                let index = key.split("_")[0];
                let left = parseInt(index.split(":")[0]);
                let right = parseInt(index.split(":")[1]);
                text[left] = `<span class="slang ml" aria-title="${value || "нет определения 😔"}">${text[left]}`;
                text[right] = `${text[right]}</span>`;
            } else {
                word = text[parseInt(index)];
                text[parseInt(index)] = `<span class="slang ml" aria-title="${value || "нет определения 😔"}">${word}</span>`;
            }
        });
        callback(text.join(" "));
        document.querySelectorAll(".slang").forEach(elem => {
            elem.onmouseover = (e) => {
                let r = e.target.getBoundingClientRect();
                let box = document.querySelector(".tooltip");
                box.style.marginTop = `${r.y + 10 + r.height}px`;
                if (window.innerWidth > 736) {
                    box.style.marginLeft = `${r.x + 10}px`;
                } else if (r.x + 10 > window.innerWidth * 0.3) {
                    box.style.marginLeft = `${Math.round(window.innerWidth * 0.3)}px`;
                } else {
                    box.style.marginLeft = `${r.x + 10}px`;
                }
                box.innerText = elem.getAttribute("aria-title");
                box.style.opacity = "1";
            }

            elem.onmouseout = () => {
                let box = document.querySelector(".tooltip");
                box.style.opacity = "0";
            }
        });
    });
}


const process = () => {
    let cont = document.querySelector("div[data-qa-tag='PulseCommentsContainer']");
    if (cont) {
        cont.querySelectorAll("div").forEach(div => {
            if (div.classList.contains("processed_ml") || div.parentNode.classList.contains("processing")) {
                return;
            }
            let classes = div.classList;
            for (let i = 0; i < classes.length; i++) {
                let className = classes[i];

                if (className.startsWith("PulseComment__commentText")) {
                    div.parentNode.classList.add("processing");
                    div.classList.add("processed_ml");
                    detect_slang(div.innerHTML, (answer) => {
                        div.innerHTML = answer;
                        div.parentNode.classList.remove("processing");
                    });
                }
            }
        });
    }

    let conts = document.querySelectorAll("div[data-qa-tag='PulsePostBody']");
    if (conts) {
        let i = 0;
        conts.forEach((div) => {
            setTimeout(() => {
                if (div.classList.contains("processed_ml") || div.parentNode.parentNode.classList.contains("processing")) {
                    return;
                }
                div.parentNode.parentNode.classList.add("processing");
                div.classList.add("processed_ml");
                detect_slang(div.innerHTML, (answer) => {
                    div.innerHTML = answer;
                    div.parentNode.parentNode.classList.remove("processing");
                });
            }, 1000 * i);
            i += 1;
        })
    }

    setTimeout(process, 5000);
}

process();

let tooltip = document.createElement("div");
tooltip.classList.add("tooltip");
document.body.appendChild(tooltip);
