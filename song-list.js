const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const _ = require('lodash')

const host = 'http://music.163.com/#'

puppeteer
    .launch({headless: true})
    .then(async browser => {
        const page = await browser.newPage()
        page.setViewport({width: 1367, height: 768})
        // 在网络连接数为0时，再进行下一步操作，确保页面加载完成
        await page.goto(`${host}/artist?id=6731`, {waitUntil: 'networkidle0'})
        const frames = await page.frames()
        // 取到目标iframe
        const targetFrame = frames.find(frame => {
            return frame.name() === 'contentFrame'
        })
        const content = await targetFrame.content()
        let $ = cheerio.load(content)
        const $list = $('#song-list-pre-cache')
        // 遍历a标签，并取到其中的对应属性，作为歌曲的链接和名称
        const songList = $list
            .find('a')
            .map((i, elem) => {
                const href = $(elem).attr('href')
                if (_.startsWith(href, '/song?id=')) {
                    const title = $(elem).find('b').attr('title')
                    return {href, title}
                }
            })
            .get()
        // 打印歌曲列表
        console.log(songList)
        await browser.close()
    })