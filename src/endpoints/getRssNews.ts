import { HLTVConfig } from '../config'
import { HLTVScraper } from '../scraper'
import { fetchPage } from '../utils'

export interface RssArticle {
    id: number | null
    title: string
    description: string
    link: string
    mediaUrl: string
    date: number
}

const urlify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex)
}

export const extractNewsId = (link: string): number | null => {
    const regexMatch = link.match(/\/news\/(\d+)/);
    return regexMatch ? parseInt(regexMatch[1], 10) : null;
}

export const getRssNews = (config: HLTVConfig) =>
    async (): Promise<RssArticle[]> => {
        const url = 'https://www.hltv.org/rss/news'
        const test = await fetchPage(url, config.loadPage)
        const $ = HLTVScraper(await fetchPage(url, config.loadPage))
        const news = $('item').toArray()
            .map((el) => {
                const title = el.find('title').text()
                const description = el.find('description').text()
                // @ts-ignore
                const link = urlify(el.text())[0]
                const id = extractNewsId(link)
                const date = new Date(el.find('pubDate').text()).getTime()
                const mediaUrl = el.find('media\\:content').attr('url')
                return {id, title, description, link, date, mediaUrl}
            })
        return news
    }