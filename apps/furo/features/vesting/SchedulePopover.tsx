import { Popover } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { SchedulePeriod, ScheduleRepresentation, Vesting, PeriodType, VestingType, Schedule } from 'features/context'
import { usePopover } from 'hooks/usePopover'
import { format } from 'date-fns'
import { FC, memo, useMemo } from 'react'
import { CalendarIcon, Typography } from '@sushiswap/ui'

interface Props {
  vesting: Vesting
  scheduleRepresentation: ScheduleRepresentation
}

const SchedulePopover: FC<Props> = ({ vesting, scheduleRepresentation }) => {
  const { styles, attributes, setReferenceElement, setPopperElement } = usePopover()
  let schedule = useMemo(
    () => new Schedule({ token: vesting.token, schedule: scheduleRepresentation }),
    [vesting, scheduleRepresentation],
  )

  return (
    <Popover>
      <Popover.Button ref={setReferenceElement}>
        <div className="flex items-center gap-2 px-5 border shadow-md cursor-pointer shadow-dark-1000 border-dark-800 bg-dark-900 rounded-xl h-11">
          <CalendarIcon width={18} height={18} />
          <Typography variant="sm" weight={700} className="text-high-emphesis">
            Schedule
          </Typography>
        </div>
      </Popover.Button>

      <Popover.Panel
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className="overflow-hidden z-10 bg-dark-900 shadow-depth-1 p-4 pb-0 rounded-xl border border-dark-800 flex flex-col gap-4 max-w-[530px]"
      >
        <div className="flex justify-between gap-4">
          <Typography variant="lg" weight={700} className="text-high-emphesis">
            Schedule
          </Typography>
          <XIcon width={24} height={24} className="text-secondary" />
        </div>
        <div className="max-h-[440px]  whitespace-nowrap overflow-auto hide-scrollbar flex flex-col divide-y divide-dark-800 border-t border-dark-800">
          {schedule?.periods.length ? (
            Object.values(schedule.periods).map((period) => (
              <SchedulePopoverItem vesting={vesting} period={period} key={period.id} />
            ))
          ) : (
            <div>
              <i>No schedule found..</i>
            </div>
          )}
        </div>
        <div className="w-full h-[60px] bottom-0 left-0 absolute bg-gradient-to-b from-[rgba(22,_21,_34,_0)] to-[#161522]" />
      </Popover.Panel>
    </Popover>
  )
}

const SchedulePopoverItem: FC<{ vesting: Vesting; period: SchedulePeriod }> = memo(({ vesting, period }) => {
  return (
    <div key={period.id} className="flex items-center justify-between gap-3 py-3">
      <div className="grid grid-cols-[30px_80px_140px] gap-2 items-center">
        <Typography variant="sm" className="capitalize" weight={700}>
          {period.type.toLowerCase()}
        </Typography>
        <Typography variant="xs" className="text-secondary" weight={500}>
          {format(period.date, 'dd MMM yyyy')} @ {format(period.date, 'h:maaa')}{' '}
        </Typography>
      </div>
      <div className="rounded-[10px] border border-dark-700 px-3 py-1 bg-dark-800">
        <Typography variant="xs" weight={500} className="text-high-emphesis">
          {period.type === PeriodType.START
            ? `-`
            : period.type === PeriodType.CLIFF
            ? `${vesting.cliffAmount.toSignificant(4)} ${period?.amount.currency?.symbol}`
            : period.type === PeriodType.STEP
            ? `${vesting.stepAmount.toSignificant(4)} ${period?.amount.currency?.symbol}`
            : period.type === PeriodType.END &&
              (vesting.vestingType === VestingType.GRADED || vesting.vestingType === VestingType.HYBRID)
            ? `${vesting.stepAmount.toSignificant(4)} ${period?.amount.currency?.symbol}`
            : `${vesting.amount.toExact()} ${period?.amount.currency?.symbol}`}
        </Typography>
      </div>
    </div>
  )
})

SchedulePopoverItem.displayName = 'HistoryPopoverTransaction'

export default SchedulePopover
