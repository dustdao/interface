import { Amount, Token } from '@sushiswap/currency'
import { Decimal, JSBI } from '@sushiswap/math'
import { FuroStatus, FuroType } from './enums'
import { toToken } from './mapper'
import { FuroRepresentation, UserRepresentation } from './representations'

export abstract class Furo {
  public readonly id: string
  public readonly type: FuroType
  public readonly status: FuroStatus
  public readonly amount: Amount<Token>
  public readonly withdrawnAmount: Amount<Token>
  public readonly startTime: Date
  public readonly endTime: Date
  public readonly modifiedAtTimestamp: Date
  public readonly recipient: UserRepresentation
  public readonly createdBy: UserRepresentation
  public readonly token: Token
  public readonly txHash: string

  public constructor({ furo }: { furo: FuroRepresentation }) {
    this.id = furo.id
    this.type = furo.__typename
    this.token = toToken(furo.token)
    this.amount = Amount.fromRawAmount(this.token, JSBI.BigInt(furo.totalAmount))
    this.withdrawnAmount = Amount.fromRawAmount(this.token, JSBI.BigInt(furo.withdrawnAmount))
    this.startTime = new Date(parseInt(furo.startedAt) * 1000)
    this.endTime = new Date(parseInt(furo.expiresAt) * 1000)
    this.modifiedAtTimestamp = new Date(parseInt(furo.modifiedAtTimestamp) * 1000)
    this.status = this.setStatus(FuroStatus[furo.status])
    this.recipient = furo.recipient
    this.createdBy = furo.createdBy
    this.txHash = furo.txHash
  }

  public get remainingTime(): { days: number; hours: number; minutes: number; seconds: number } | undefined {
    if (this.status !== FuroStatus.CANCELLED) {
      const now = Date.now()
      const interval = this.endTime.getTime() - now

      let days = Math.floor(interval / (1000 * 60 * 60 * 24))
      let hours = Math.floor((interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      let minutes = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.floor((interval % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds }
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  public get startingInTime(): { days: number; hours: number; minutes: number; seconds: number } | undefined {
    if (this.status === FuroStatus.ACTIVE || this.status === FuroStatus.UPCOMING) {
      const now = Date.now()
      const interval = this.startTime.getTime() - now

      let days = Math.floor(interval / (1000 * 60 * 60 * 24))
      let hours = Math.floor((interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      let minutes = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.floor((interval % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds }
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  public get activeTime(): { days: number; hours: number; minutes: number; seconds: number } | undefined {
    const now = this.status !== FuroStatus.CANCELLED ? Date.now() : new Date(this.modifiedAtTimestamp).getTime()

    const interval = now - this.startTime.getTime()

    let days = Math.floor(interval / (1000 * 60 * 60 * 24))
    let hours = Math.floor((interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutes = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((interval % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  /**
   * Returns streamed percentage in decimals, e.g. 0.562
   */
  public get streamedPercentage(): number {
    if (!this.isStarted) return 0
    const now = this.status !== FuroStatus.CANCELLED ? Date.now() : this.modifiedAtTimestamp.getTime()
    const total = this.endTime.getTime() - this.startTime.getTime()
    const current = now - this.startTime.getTime()
    const streamed = current / total
    return streamed < 1 ? streamed : 1
  }

  public get withdrawnPercentage(): number {
    if (this.withdrawnAmount.toExact() === "0") return 0
    return Decimal(this.withdrawnAmount.toExact()) / Decimal(this.amount.toExact())
  }

  public get streamedAmount(): string {
    if (!this.isStarted) return '0'
    return Decimal(this.amount.toExact()).mul(this.streamedPercentage).toString()
  }

  public get unclaimableAmount(): string {
    if (!this.isStarted) return '0'
    const leftToStreamPercentage = 1 - this.streamedPercentage
    return Decimal(this.amount.toExact()).mul(leftToStreamPercentage).toString()
  }

  public get isStarted(): boolean {
    return this.startTime.getTime() <= Date.now()
  }

  public get isEnded(): boolean {
    return this.status === FuroStatus.CANCELLED || this.endTime.getTime() <= Date.now()
  }

  private setStatus(status: FuroStatus): FuroStatus {
    if (!this.isStarted) return FuroStatus.UPCOMING
    if (status === FuroStatus.CANCELLED || status === FuroStatus.EXTENDED) return status
    if (this.isEnded) return FuroStatus.COMPLETED
    return status
  }
}
