# 一个用puppeteer实现的网易云音乐评论爬虫

# 使用
可能需要v7.6.0以上的node版本

- `npm install`
- 在music.js替换需要爬取歌手的链接
- `node music.js`
- 在content.html中生成
# todo
1. ~~实现评论翻页爬取~~，在多次翻页后，网易云音乐的评论页面会出现评论不更新的bug，手动测试也是如此，我的内心是崩溃的...
2. 数据库存储
3. 评论数据分析