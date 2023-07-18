import { createPublicClient, getContract, http } from "viem"
import { normalize } from "viem/ens"
import { Chain } from "wagmi"

import { DataTable } from "@/components/ui/data-table"
import { env } from "@/env.mjs"
import { getChain } from "@/lib/utils"
import { abi } from "@/lib/vestingAbi"
import { ProcessedSchedule, Schedule } from "@/types/schedule"

import { columns } from "./columns"

const chain: Chain = getChain(Number(env.NEXT_PUBLIC_CHAIN_ID))

const client = createPublicClient({
  chain: chain,
  transport: http(
    `${chain.rpcUrls.alchemy.http[0]}/${env.NEXT_PUBLIC_ALCHEMY_KEY}`
  ),
})

export const revalidate = 60 * 60 * 1 // revalidate every hour

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

    let ensName = null

    try {
      ensName = await client.getEnsName({
        address: schedule.beneficiary as `0x${string}`,
      })
    } catch (e) {
      console.log("error getting ens name", e)
    }

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
