import { useCallback } from 'react'
import { hooks } from 'app/components/connectors/metaMask'
import { useStakingContract } from 'app/hooks/useContract'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { IncentiveCreationFormInputFormatted } from 'app/features/Staking/IncentiveCreationForm/'

const useIncentiveCreate = () => {
  const account = hooks.useAccount()
  const addTransaction = useTransactionAdder()
  const contract = useStakingContract(true)



  const subscribe = useCallback(
    (event: string, cb) => {
      if (!contract) return

      contract.on(event, cb)
    },
    [contract]
  )

  const unsubscribe = useCallback(
    (event: string, cb) => {
      if (!contract) return

      contract.off(event, cb)
    },
    [contract]
  )


  const init = useCallback(
    async (data: IncentiveCreationFormInputFormatted) => {
      if (!contract) throw new Error('Contract not initialized')
      if (!account) throw new Error('Wallet not connected')
      const startDateUnix = data.startDate.getTime() / 1000
      const endDateUnix = data.endDate.getTime() / 1000

      const tx = await contract.createIncentive(data.pool.address, data.rewardToken.address, data.amount.toExact(), startDateUnix, endDateUnix)

      addTransaction(tx, { summary: 'Initialize Incentive creation' })
      
      return tx
    },
    [account, contract, addTransaction],
  )

  return {
    subscribe,
    unsubscribe,
    createIncentive: init,
  }
}

export default useIncentiveCreate
