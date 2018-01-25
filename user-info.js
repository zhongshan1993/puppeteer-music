const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const he = require('he');
const fs = require('fs');

puppeteer.launch({
    headless: false
}).then(async browser => {
    const page = await browser.newPage();
    page.setViewport({
        width: 1367,
        height: 768
    });
    await page.goto('', {
        waitUntil: 'domcontentloaded'
    });
    // await page.screenshot({
    //     path: 'images/01.png'
    // });
    // await page.emulateMedia('screen');
    // await page.pdf({
    //     path: 'page.pdf'
    // });
    await page.type('#Username', '');
    // 需密码信息
    await page.type('#Password2', '');
    await page.keyboard.press('Enter');

    page.on('load', async () => {
        // 从上一条工号开始爬
        let num = 109354;
        const page1 = await browser.newPage();
        while(num++ < 999999) {
            await page1.goto(``, {
                waitUntil: 'domcontentloaded'
            });
            const html = await page1.content();
            const $html = cheerio.load(html);
            if (!$html('#table_jyjl').length) {
                continue;
            }
            let university = he.decode($html('#table_jyjl > tbody > tr').eq(0).find('td').eq(1).html() || '没有对应教育信息');
            
            let info = `${num} ===> ${he.decode($html('#peoplename').html())} ===> ${university}\n`;
            fs.appendFile('./data.txt', info, (err) => {
                console.log(err);
            });
        }
    })

    // other actions...
    // await browser.close();
});