// import { useWeb3React } from '@web3-react/core'
import { Token } from 'currency'
import { useMemo, useState } from 'react'
import NoSSR from 'react-no-ssr'
import MetaMaskCard from '../../components/connectors/MetaMaskCard'
import { filterTokens } from '../../functions/filtering'
import { useTokenComparator } from '../../functions/sorting'
import { useAllTokens } from '../../hooks/Tokens'
import useDebounce from '../../hooks/useDebounce'
import { useCombinedActiveList } from '../../state/lists/hooks'

const DEFAULT_START_DATE = new Date()
DEFAULT_START_DATE.setDate(DEFAULT_START_DATE.getDate() + 1)

const DEFAULT_END_DATE = new Date()
DEFAULT_END_DATE.setDate(DEFAULT_END_DATE.getDate() + 7)

export default function Incentive() {
  const [token, setToken] = useState<string>('')

  const tokens = useCombinedActiveList()
  const allTokens = useAllTokens()  
  const tokenComparator = useTokenComparator()

  const sortedTokens: Token[] = useMemo(() => {
    return Object.values(allTokens).sort(tokenComparator)
  }, [allTokens, tokenComparator])
 
  const [startDate, setStartDate] = useState<Date>(DEFAULT_START_DATE)
  const [endDate, setEndDate] = useState<Date>(DEFAULT_END_DATE)


  function toUnix(date: Date): string {
    return (date.getTime() / 1000).toFixed().toString()
  }

  return (
    <div>
      <NoSSR>
        <MetaMaskCard />
      </NoSSR>

      <h1>Create Incentive</h1>
      Pool:
      <div>
    <select onChange={() => {}}>
      {}
      </select>
    </div>
      Token:
    <div>
    <select onChange={(e) => setToken(e.target.value)}>
      {sortedTokens.map((token, i) => (<option value={token.address} key={i}>{token.symbol}</option> ))}
      </select>
    </div>
  
    <div>
      Amount:
     <div>
     <input></input>
      </div>

      <div>
          <label>Start: </label>
          <div>

          <input type="datetime-local" onChange={(e) => setStartDate(new Date(e.target.value))}></input>
          </div>
        </div>
        <div>
          <label>End: </label>
          <div>

          <input type="datetime-local" onChange={(e) => setEndDate(new Date(e.target.value))}></input>
          </div>
        </div>


    </div>
    </div>
  )
}
