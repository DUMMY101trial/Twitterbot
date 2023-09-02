const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const init = require("./intro");
var axios = require("axios");

puppeteer.use(StealthPlugin);
const sleep = (page, duration) => {
  setTimeout(async () => {
    await page.waitForTimeout(duration);
    console.log("______________________IDLING_______________________");
  }, 2000);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mainType = async (page, text) => {
  const input = await page.$x(`//input[@name="text"]`);
  if (input.length > 0) {
    console.log("#[INFO] INPUT FOUND", text);
    input[0].focus();
    input[0].press("Backspace");
    await input[0].type(text, { delay: 100 });
  }
};
const passwordType = async (page, text) => {
  const input = await page.$x(`//input [@name="password"]`);
  if (input.length > 0) {
    console.log("#[INFO] INPUT FOUND", text);
    input[0].focus();
    await page.keyboard.type(text, { delay: 10 });
  }
};
const nextAuth = async (page) => {
  const next = await page.$x(`//div[@role="button"]`);
  if (next.length > 0) {
    console.log("#[INFO]NEXT BUTTON fOUND");
    next[2] ? await next[2].click() : await next[1].click();
    // Wait for the specific network response before proceeding
    console.log("#[INFO]NEXT BUTTON CLICKED");
  }
};

const parms =
  process.env.NODE_ENV == "production"
    ? {
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      }
    : {
        headless: false,
      };
const loadpage = async (io) => {
  const browser = await puppeteer.launch(parms);
  io.emit("bot", "headless service mode activated");
  const page = await browser.newPage();
  await page.setViewport({
    width: 1180,
    height: 550,
    deviceScaleFactor: 1,
  });
  page.setGeolocation({ latitude: 40.628, longitude: -74.002 });
  io.emit(
    "bot",
    "geolocation for context latitude: 40.628, longitude: -74.002"
  );
  //go to page
  await page.goto("https://twitter.com/i/flow/login", {
    waitUntil: "networkidle2",
  });
  sleep(page, 2000);
  return page;
};

const authinticateEmail = async (page, io) => {
  io.emit("bot", "Twitter authentication started");
  io.emit("bot", "username:ijusthitth57069");
  try {
    io.emit("bot", "typing...");
    await mainType(page, "ijusthitth57069");
    sleep(page, 3000);
    await nextAuth(page);
    const res = await page.waitForResponse((response) =>
      response.url().includes("https://api.twitter.com")
    );
    const data = await res.json();
    io.emit("bot", JSON.stringify(data));
    if (data.subtasks && data.subtasks[0] && data.subtasks[0].enter_text) {
      if (data.subtasks[0].enter_text.primary_text.text.includes("username")) {
        console.log("#[INFO]SECONDARY GIVING USERNAME");
      }
      await mainType(page, "lotto@freemailonline.us");
      await nextAuth(page);
    }
    if (data.subtasks && data.subtasks[0] && data.subtasks[0].enter_password) {
      console.log("#[INFO]GOING TO PASSWORD");
      io.emit("bot", "#[INFO]TYPING PASSWORD :########");
      await passwordType(page, "!@#password456");
      await nextAuth(page);
      io.emit("bot", "#[INFO] LOGIN SUCCESSFUL");
      console.log(
        "\x1b[32m%s\x1b[0m",
        `
  ██╗      ██████╗  ██████╗ ██╗███╗   ██╗
  ██║     ██╔═══██╗██╔════╝ ██║████╗  ██║
  ██║     ██║   ██║██║  ███╗██║██╔██╗ ██║
  ██║     ██║   ██║██║   ██║██║██║╚██╗██║
  ███████╗╚██████╔╝╚██████╔╝██║██║ ╚████║
  ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝
                                         

`
      );
    }
  } catch (error) {
    io.emit("bot", `#[ERROR] ${error.message}`);
    console.log(error.message);
  }
};
//generating tweet from AI
const tweetGen = async (data) => {
  try {
    const response = await axios.post(
      "https://chatterlow.up.railway.app/api/v1/prediction/60a6f0d3-c6c0-4d05-a268-90f5ffbcd8d7",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

const botPost = async (page,io) => {
  try {
    console.log("\x1b[33m%s\x1b[0m", "[ROUTE]:/HOME");
    io.emit("bot", "#[INFO] generating tweet");
    const tweet = await tweetGen({ question: "write a very short sexy tweet" });
    io.emit("bot", "#[INFO] LOGIN SUCCESSFUL");
    console.log(tweet);
    io.emit("bot", `#[TWEET] ${tweet}`);
    const InputDiv = await page.$$(`.DraftEditor-editorContainer`);
    if (InputDiv.length > 0) {
      InputDiv[0].click();
      InputDiv[0].press("Backspace");
      InputDiv[0].press("Backspace");
      InputDiv[0].press("Backspace");
      io.emit("bot", "#[INFO] Typing tweet...");
      await page.keyboard.type(` ${tweet}`, { delay: 100 });
      console.log("DONE TYPING");
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Input element not found.");
    }
  } catch (error) {
    io.emit("bot", `#[ERROR]${error.message}`);
    console.log(error.message);
  }
  io.emit("bot", "#[INFO] posting ...");
  const btn = await page.$x(`//div[@data-testid="tweetButtonInline"]`);
  const fallbtn = await page.$x(`//div[@data-testid="tweetButton"]`);
  if (btn.length > 0) {
    await btn[0].click();
    await btn[0].click();
    if (fallbtn.length > 0) {
      await fallbtn[0].click();
      await fallbtn[0].click();
    }
    io.emit("bot", "#[SUCCESS] POST ADDED SUCCESSFUL");

    console.log(`
        
    ██████╗  ██████╗ ███████╗████████╗     █████╗ ██████╗ ██████╗ ███████╗██████╗ 
    ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
    ██████╔╝██║   ██║███████╗   ██║       ███████║██║  ██║██║  ██║█████╗  ██║  ██║
    ██╔═══╝ ██║   ██║╚════██║   ██║       ██╔══██║██║  ██║██║  ██║██╔══╝  ██║  ██║
    ██║     ╚██████╔╝███████║   ██║       ██║  ██║██████╔╝██████╔╝███████╗██████╔╝
    ╚═╝      ╚═════╝ ╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚══════╝╚═════╝ 
        `);
  }
};

const initializationBot = async (io) => {
  try {
    init();
    io.emit("bot", "puppeteer starting ...");
    const page = await loadpage(io);
    io.emit("bot", "puppeteer up and running ...");
    await authinticateEmail(page, io);
    io.emit("bot", "#[INFO] AUTHENTICATION SUCCESSFUL");
    await page.waitForNavigation({ url: "https://twitter.com/home" });
    io.emit("bot", "#[INFO] REDIRECTING TO /HOME");
    io.emit("bot", "#[INFO] 50 POSTS LOOP");
    for (let i = 1; i <= 50; i++) {
      io.emit("bot", `#[INFO] AUTOMATED POSTING LOOP [DELAY:30S] [COUNT:${i}]`);
      await delay(30000);
      await botPost(page, io);
    }
    // await botPost(page);
    return page;
  } catch (error) {
    io.emit("bot", `#[ERROR]:${error.message}`);
    console.log(error.message);
  }

  // await browser.close();
};
const automatedPosting = async (io) => {
  io.emit("bot", "BOT AUTOMATED POSTING INITIATED");
  const page = await initializationBot(io);
};
module.exports = {
  initializationBot,
  automatedPosting,
  loadpage,
};
