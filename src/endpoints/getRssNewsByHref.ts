import { HLTVConfig } from '../config'
import { HLTVScraper } from '../scraper'
import { fetchPage } from '../utils'

export interface RssArticleHref {
  titleNews?: string
  date?: number
  author?: string
  headertext?: string
  image?: { link: string }[]
  image_text?: string
  newsText?: { text: string }[]
}

export const getRssNewsByHref =
  (config: HLTVConfig) =>
  async ({ href }: { href: string }): Promise<RssArticleHref> => {
    const url = href
    const $ = HLTVScraper(await fetchPage(url, config.loadPage))

    const titleNews = $('title').text();
    const headertext = $('.headertext').text();
    const date = new Date($('.date').text()).getTime();
    const author = $('.authorName').text();
    const image = $('.image-con img')
      .toArray()
      .map((el) => ({
        link: el.attr('src')
      }));

    const image_text = $('.imagetext').text();

    const newsText = $('.news-block')
      .toArray()
      .map((el) => ({
        text: el.text().replace(/\\"/g, '')
      }));

    return {
      titleNews,
      headertext,
      date,
      author,
      image,
      image_text,
      newsText
    }
  }
