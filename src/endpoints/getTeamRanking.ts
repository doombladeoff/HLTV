import { HLTVConfig } from '../config'
import { HLTVScraper } from '../scraper'
import { Team } from '../shared/Team'
import { fetchPage, getIdAt } from '../utils'

export interface TeamRanking {
  team: Team
  points: number
  place: number
  change: number
  isNew: boolean
}

export interface GetTeamArguments {
  year?:  2015 | 2016| 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024
  month?:
    | 'january'
    | 'february'
    | 'march'
    | 'april'
    | 'may'
    | 'june'
    | 'july'
    | 'august'
    | 'september'
    | 'october'
    | 'november'
    | 'december'
  day?: number
  country?: string
}

export const getTeamRanking =
  (config: HLTVConfig) =>
  async ({ year, month, day, country }: GetTeamArguments = {}): Promise<
    TeamRanking[]
  > => {
    let $ = HLTVScraper(
      await fetchPage(
        `https://www.hltv.org/ranking/teams/${year ?? ''}/${month ?? ''}/${
          day ?? ''
        }`,
        config.loadPage
      )
    )

    if (country) {
      const redirectedLink = $('.ranking-country > a').first().attr('href')
      const countryRankingLink = redirectedLink
        .split('/')
        .slice(0, -1)
        .concat(country)
        .join('/')

      $ = HLTVScraper(
        await fetchPage(
          `https://www.hltv.org/${countryRankingLink}`,
          config.loadPage
        )
      )
    }

    const teams = $('.ranked-team')
      .toArray()
      .map((el) => {
        const points = Number(
          el.find('.points').text().replace(/\(|\)/g, '').split(' ')[0]
        )
        const place = Number(el.find('.position').text().substring(1))

        const team = {
          name: el.find('.name').text(),
          id: el.find('.moreLink').attrThen('href', getIdAt(2)),
          logo: el.find('.team-logo img').attr('src') || ''
        }
        var players = [];
        for (var i = 0; i < el.find('.player-holder').length; i++) {
            var playerHolderEl = el.find('.player-holder').eq(i);
            var player = {
            name: playerHolderEl.find('.nick').text(),
            image: playerHolderEl.find('.playerPicture').attr('src') || '' ,
            country: {
                title: playerHolderEl.find('.nick img').attr('alt'),
                src: 'https://www.hltv.org' + playerHolderEl.find('.nick img').attr('src') || '' ,
            }
            };
            players[i] = player;
        }

        const changeText = el.find('.change').text()
        const isNew = changeText === 'NEW TEAM'
        const change = changeText === '-' || isNew ? 0 : Number(changeText)

        return { points, place, team, players, change, isNew }
      })

    return teams
  }
