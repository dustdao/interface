import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
import { Token } from 'currency'
import { useMemo } from 'react'
import { hooks } from '../components/connectors/metaMask'
// import { useActiveWeb3React } from 'app/services/web3'
import { useCombinedActiveList } from '../state/lists/hooks'

export function useAllTokens(): { [address: string]: Token } {
  const allTokens = useCombinedActiveList()
  // const chainId = hooks.useChainId() 
  // TODO: No SSR?
  const chainId = hooks.useChainId()

  return useMemo(() => {
    if (!chainId) return {}

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(allTokens[chainId]).reduce<{
      [address: string]: Token
    }>((newMap, address) => {
      newMap[address] = allTokens[chainId][address].token
      return newMap
    }, {})

    return mapWithoutUrls
  }, [chainId, allTokens])
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
  const activeTokens = useAllTokens()

  if (!activeTokens || !token) {
    return false
  }

  return !!activeTokens[token.address]
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
}

// // undefined if invalid or does not exist
// // null if loading or null was passed
// // otherwise returns the token
// export function useToken(tokenAddress?: string | null): Token | undefined | null {
//   const { chainId } = useActiveWeb3React()
//   const tokens = useAllTokens()

//   const address = isAddress(tokenAddress)

//   const tokenContract = useTokenContract(address ? address : undefined, false)
//   const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false)
//   const token: Token | undefined = address ? tokens[address] : undefined

//   const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
//   const tokenNameBytes32 = useSingleCallResult(
//     token ? undefined : tokenContractBytes32,
//     'name',
//     undefined,
//     NEVER_RELOAD
//   )
//   // TODO: simplify?
//   const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)
//   const symbolBytes32 = useSingleCallResult(token ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
//   const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

//   return useMemo(() => {
//     if (token) return token
//     if (tokenAddress === null) return null
//     if (!chainId || !address) return undefined
//     if (decimals.loading || symbol.loading || tokenName.loading) return null
//     if (decimals.result) {
//       return new Token(
//         chainId,
//         address,
//         decimals.result[0],
//         parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
//         parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token')
//       )
//     }
//     return undefined
//   }, [
//     address,
//     chainId,
//     decimals.loading,
//     decimals.result,
//     symbol.loading,
//     symbol.result,
//     symbolBytes32.result,
//     token,
//     tokenAddress,
//     tokenName.loading,
//     tokenName.result,
//     tokenNameBytes32.result,
//   ])
// }