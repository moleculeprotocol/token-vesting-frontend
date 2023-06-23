import { createPublicClient, getContract, http } from "viem"
import { normalize } from "viem/ens"

import { DataTable } from "@/components/ui/data-table"
import { env } from "@/env.mjs"
import { getChain } from "@/lib/utils"
import { abi } from "@/lib/vestingAbi"
import { ProcessedSchedule, Schedule } from "@/types/schedule"

import { columns } from "./columns"

const client = createPublicClient({
  chain: getChain(Number(env.NEXT_PUBLIC_CHAIN_ID)),
  transport: http(
    `https://eth-${
      getChain(Number(env.NEXT_PUBLIC_CHAIN_ID)).network == "homestead"
        ? "mainnet"
        : getChain(Number(env.NEXT_PUBLIC_CHAIN_ID)).network
    }.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_KEY}`
  ),
})

export const revalidate = 60 * 60 * 8 // revalidate every 8 hours

export default async function Page() {
  let schedules: ProcessedSchedule[] = []

  const vestingContract = getContract({
    address: env.NEXT_PUBLIC_VESTING_CONTRACT as `0x${string}`,
    abi: abi,
    publicClient: client,
  })

  const scheduleIds = await vestingContract.read.getVestingSchedulesIds()

  for (let i = 0; i < scheduleIds.length; i++) {
    const schedule: Schedule = await vestingContract.read.getVestingSchedule([
      scheduleIds[i] as `0x${string}`,
    ])

    const releasableAmount = await vestingContract.read.computeReleasableAmount(
      [scheduleIds[i]]
    )

    const ensName = await client.getEnsName({
      address: schedule.beneficiary as `0x${string}`,
    })

    let avatar = null
    if (ensName) {
      const ensText = await client.getEnsAvatar({
        name: normalize(ensName),
      })
      avatar = ensText as string
    }

    schedules.push({
      ...schedule,
      ...{ id: scheduleIds[i], releasableAmount, ensName, ensAvatar: avatar },
    })
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        All Schedules
      </h1>
      <DataTable columns={columns} data={schedules} />
    </>
  )
}
