//selectors
const start_btn = document.querySelector(".start");
const log_container = document.querySelector(".log_items");
const stop_btn = document.querySelector(".stop");
//event handlers
start_btn.onclick = () => {
  startBot();
};
stop_btn.onclick = () => {
  stopBot();
};

//middleware
const startBot = async () => {
  try {
    const response = await fetch(`${window.location.href}botpost`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }).then((response) => response.json());
    console.log(response);
  } catch (e) {
    console.log(e.message);
  }
};
const stopBot = async () => {
  await fetch(`${window.location.href}stop`)
    .then((res) => res.json())
    .then((data) => {
      console.log("data");
    });
};

const mapLogs = (logs) => {
  const log = document.createElement("p");
  log.classList = ["log_int"];
  logs.forEach((item) => {
    log.innerHTML = `${item}`;
    if (item.color) {
      log.innerHTML = `${item.message}`;
      log.style.color = item.color;
    } else {
      log.style.color = "#72aaf3c2";
    }
    log_container.appendChild(log);
  });
};

//logs and ws controllers
const logItems = ["init"];

try {
  var socket = io();
  const ws_init = "client connected";
  socket.on("connect", () => {
    logItems.push(ws_init);
    mapLogs(logItems);
  });
  socket.on("bot", (data) => {
    logItems.push(data);
    mapLogs(logItems);
  });
} catch (error) {
  throw error;
}
