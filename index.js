const puppeteer = require("puppeteer");
const axios = require("axios");
const JSZip = require("jszip");
const fs = require("fs");

const chapterUrl = "https://asuracomic.net/series/solo-leveling-da6d1988/chapter/1";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(chapterUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector("img");

  const imageUrls = await page.$$eval("img", imgs =>
    imgs.map(img => img.src).filter(src => src.includes("asuracomic"))
  );

  console.log(`✅ Found ${imageUrls.length} images`);

  const zip = new JSZip();

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const res = await axios.get(url, { responseType: "arraybuffer" });
    zip.file(`${String(i + 1).padStart(3, "0")}.jpg`, res.data);
    console.log(`⬇️ Added image ${i + 1}`);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync("solo-leveling-ch1.zip", zipBuffer);
  console.log(`✅ ZIP file saved as solo-leveling-ch1.zip`);

  await browser.close();
})();
