import { addYears, getUnixTime } from 'date-fns'
import numeral from 'numeral'
import Table from 'cli-table3'

import { getBuiltGraphSDK } from '../.graphclient'
import chalk from 'chalk'

const secondsPerBlock = 13.4

export async function chef() {
  const sdk = getBuiltGraphSDK()

  const { MASTERCHEF_V1_pools: poolsV1, MASTERCHEF_V2_pools: poolsV2 } = await sdk.MasterChefPools()

  const { ETHEREUM_EXCHANGE_pairs: pairs } = await sdk.EthereumPairs({
    where: { id_in: [...poolsV1, ...poolsV2].reduce((acc, cur) => [...acc, cur.pair], [] as string[]) },
  })

  const sushiPriceUSD = await (async function () {
    {
      const { ETHEREUM_EXCHANGE_tokens: tokens, ETHEREUM_EXCHANGE_bundle: bundle } = await sdk.EthereumTokenPrices({
        where: { id_in: ['0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'] },
      })

      return bundle!.ethPrice * tokens[0].derivedETH
    }
  })()

  const digestPools = (pools: typeof poolsV1, sushiPerBlock: number) =>
    pools
      .map((pool) => {
        const pair = pairs.find((pair) => pair.id === pool.pair)

        if (!pair) return

        const tvl = ((pair.reserveUSD / pair.totalSupply) * pool.slpBalance) / 1e18
        const sushiPerSecond = ((pool.allocPoint / pool.masterChef.totalAllocPoint) * sushiPerBlock) / secondsPerBlock
        const apr = (getUnixTime(addYears(0, 1)) * sushiPerSecond * sushiPriceUSD) / tvl

        return {
          Index: pool.id,
          'Pair Name': `${pair.token0.symbol}-${pair.token1.symbol}`,
          'Pair Address': pair.id,
          'Farm TVL': numeral(tvl).format('$0.00a'),
          APs: pool.allocPoint,
          'Sushi/s': sushiPerSecond.toFixed(6),
          APR: numeral(apr).format('0.00 %'),
        }
      })
      .filter((pair) => pair !== undefined)
      .sort((a, b) => Number(a!.Index) - Number(b!.Index))
      .map((pair) => pair as NonNullable<typeof pair>)

  const digestedV1 = digestPools(poolsV1, 100)
  if (digestedV1.length > 0) {
    const table = new Table({ head: Object.keys(digestedV1[0]) })
    digestedV1.forEach((pool) => table.push(Object.values(pool)))
    console.log(chalk.red('MasterChef V1'))
    console.log(chalk.blue(`Total Alloc Points: ${poolsV1[0].masterChef.totalAllocPoint}`))
    console.log(table.toString())
  }

  const digestedV2 = digestPools(
    poolsV2,
    (poolsV2[0].masterChef.totalAllocPoint / poolsV1[0].masterChef.totalAllocPoint) * 100,
  )
  if (digestedV2.length > 0) {
    const table = new Table({ head: Object.keys(digestedV2[0]) })
    digestedV2.forEach((pool) => table.push(Object.values(pool)))
    console.log(chalk.red('MasterChef V2'))
    console.log(chalk.blue(`Total Alloc Points: ${poolsV2[0].masterChef.totalAllocPoint}`))
    console.log(table.toString())
  }
}
