const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const he = require('he')
const fs = require('fs')
const _ = require('lodash')

const host = 'http://music.163.com/#'

/**
 * 抽象出抓取评论的函数，便于进一步开发
 * @param {*} sTargetFrame 
 */
const collectCommentList = async(sTargetFrame) => {
    const sContent = await sTargetFrame.content()
    const $ = cheerio.load(sContent)
    const res = $('#comment-box')
        .find('.itm')
        .map((i, elem) => {
            const brk = $(elem).find('.cntwrap .f-brk')
            const brkText = brk.text()
            // 用户名
            const username = $(brk)
                .find('a')
                .text()
            // 评论字符串
            const commentStr = $(brk)
                .text()
                .replace(username, '')
            return {username, commentStr}
        })
        .get()
    fs.appendFile('./content.html', JSON.stringify(res) + '\n')
    return res
}

puppeteer
    .launch({headless: true})
    .then(async browser => {
        const page = await browser.newPage()
        page.setViewport({width: 1367, height: 768})
        await page.goto(`${host}/artist?id=6731`, {waitUntil: 'networkidle0'})

        const frames = await page.frames()

        const targetFrame = frames.find(frame => {
            return frame.name() === 'contentFrame'
        })

        const content = await targetFrame.content()

        let $ = cheerio.load(content)

        const $list = $('#song-list-pre-cache')

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

        let index = 0
        let songItem
        console.log(`一共${songList.length}首歌`)
        while (songItem = songList[index++]) {
            const sPage = await browser.newPage()
            console.log(`正在收集${songItem.title}下的评论`)
            await sPage.goto(`${host}${songItem.href}`, {
                waitUntil: 'networkidle2',
                timeout: 0
            })
            const sFrames = await sPage.frames()
            const sTargetFrame = sFrames.find(frame => {
                return frame.name() === 'contentFrame'
            })

            let commentList = await collectCommentList(sTargetFrame)

            sPage.close()
        }

        await browser.close()
    })