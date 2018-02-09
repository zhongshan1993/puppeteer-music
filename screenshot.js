// 加载之前安装的 puppeteer
const puppeteer = require('puppeteer')

async function getPic() {
  // 创建一个chrome实例
  const browser = await puppeteer.launch()
  // 打开一个新的页面
  const page = await browser.newPage()
  // 设置页面宽高
  page.setViewport({
    width: 1920,
    height: 2000
  })
  // 在我们创建的这个页面下，转到公司内网首页
  await page.goto('http://777.nd.com.cn/html/index.html')
  // 在当前目录下生成nd.png截图
  await page.screenshot({path: 'nd.png'})
  // 最后，关闭浏览器
  await browser.close()
}

getPic()

// const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto('http://777.nd.com.cn/html/index.html');

//   // Get the "viewport" of the page, as reported by the page.
//   const dimensions = await page.evaluate(() => {
//     return {
//       width: document.documentElement.clientWidth,
//       height: document.documentElement.clientHeight,
//       deviceScaleFactor: window.devicePixelRatio
//     };
//   });

//   console.log('Dimensions:', dimensions);
//   await browser.close();
// })();