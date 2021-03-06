import Layout from 'components/Layout'
import { StreamRepresentation, VestingRepresentation } from 'features/context/representations'
import CreateStreamModal from 'features/stream/CreateStreamModal'
import { FuroTable, FuroTableType } from 'features/FuroTable'
import CreateVestingModal from 'features/vesting/CreateVestingModal'
import { FC } from 'react'
import { Typography } from '@sushiswap/ui'
import { getStreams, getVestings } from 'graph/graph-client'

interface DashboardProps {
  streams: { incomingStreams: StreamRepresentation[]; outgoingStreams: StreamRepresentation[] }
  vestings: { incomingVestings: VestingRepresentation[]; outgoingVestings: VestingRepresentation[] }
}
const Dashboard: FC<DashboardProps> = ({ streams, vestings }) => {
  return (
    <Layout>
      <div className="flex flex-col h-full gap-12 pt-40">
        <Typography variant="h2" weight={700} className="text-high-emphesis">
          Dashboard
        </Typography>
        <div className="flex gap-5">
          <CreateStreamModal />
          <CreateVestingModal />
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <Typography variant="lg" weight={700} className="text-high-emphesis">
              Incoming
            </Typography>
            <FuroTable
              streams={streams.incomingStreams ?? []}
              vestings={vestings.incomingVestings ?? []}
              type={FuroTableType.INCOMING}
            />
          </div>
          <div className="flex flex-col gap-5">
            <Typography variant="lg" weight={700} className="text-high-emphesis">
              Outgoing
            </Typography>
            <FuroTable
              streams={streams.outgoingStreams ?? []}
              vestings={vestings.outgoingVestings ?? []}
              type={FuroTableType.OUTGOING}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

export async function getServerSideProps({ query }) {
  return {
    props: {
      streams: await getStreams(query.chainId, query.address),
      vestings: await getVestings(query.chainId, query.address),
    },
  }
}
