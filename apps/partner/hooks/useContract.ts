import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'

import MULTICALL2_ABI from 'app/abis/multicall2.json'
import INCENTIVE_ABI from 'app/abis/incentive.json'
import {
  MULTICALL2_ADDRESS,
} from '@sushiswap/core-sdk'
import { hooks } from '../components/connectors/metaMask'
import { useMemo } from 'react'
import { getContract } from 'app/functions/contract'
import ERC20_ABI from 'app/abis/ERC20.json'
import ERC20_BYTES32_ABI from 'app/abis/erc20_bytes32.json'

const INCENTIVE_CONTRACT = "0x1ced9b90aa573849b42adac7204860823c290dac"

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const library = hooks.useProvider()
  const account = hooks.useAccount()
  return useMemo(() => {
    if (!address || address === AddressZero || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}


export function useMulticall2Contract() {
  const chainId = hooks.useChainId()
  return useContract(chainId ? MULTICALL2_ADDRESS[chainId] : undefined, MULTICALL2_ABI, false)
}


export function useStakingContract( withSignerIfPossible = true): Contract | null {
  return useContract(INCENTIVE_CONTRACT, INCENTIVE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}