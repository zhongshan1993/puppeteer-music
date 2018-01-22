const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const he = require('he');
const fs = require('fs');
const _ = require('lodash');

const host = 'http://music.163.com/#';

puppeteer.launch({
    headless: true
}).then(async browser => {
    const page = await browser.newPage();
    page.setViewport({
        width: 1367,
        height: 768
    });
    await page.goto(`${host}/artist?id=1007170`, {
        waitUntil: 'networkidle0'
    });

    const frames = await page.frames();

    const targetFrame = frames.find(frame => {
        return frame.name() === 'contentFrame';
    });

    const content = await targetFrame.content();

    let $ = cheerio.load(content);

    const $list = $('#song-list-pre-cache');

    const songList = $list.find('a').map((i, elem) => {
        const href = $(elem).attr('href');
        if (_.startsWith(href, '/song?id=')) {
            const title = he.decode($(elem).find('b').attr('title'));
            return {
                href,
                title
            };
        }
    }).get();

    let index = 0;
    let songItem;
    console.log(`一共${songList.length}首歌`);
    while(songItem = songList[index++]) {
        const sPage = await browser.newPage();
        console.log(`正在收集${songItem.title}下的评论`);
        await sPage.goto(`${host}${songItem.href}`, {
            waitUntil: 'networkidle2',
            timeout: 0
        });
        const sFrames = await sPage.frames();
        const sTargetFrame = sFrames.find(frame => {
            return frame.name() === 'contentFrame';
        });
        const sContent = await sTargetFrame.content();
        
        const $ = cheerio.load(sContent);
        const comentList = $('#comment-box').find('.itm').map((i, elem) => {
            const brk = $(elem).find('.cntwrap .f-brk');
            const brkText = he.decode(brk.text());

            // 用户名
            const username = $(brk).find('a').text();
            // 评论字符串
            const commentStr = $(brk).text().replace(username, '');

            fs.appendFile('./content.html', `${username} ${commentStr}\n\n`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            return he.decode(brk.html());
        }).get();

        sPage.close();
    }


    // fs.appendFile('./content.html', JSON.stringify(songList), (err) => {
    //     console.log(err);
    // });

    // other actions...
    // await browser.close();
});