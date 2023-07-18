import { Metadata } from "next"
import { createPublicClient, getContract, http } from "viem"

import { env } from "@/env.mjs"
import { getChain, truncateAddress } from "@/lib/utils"
import { abi } from "@/lib/vestingAbi"
import { ProcessedSchedule, Schedule } from "@/types/schedule"

import { UserTable } from "./user-table"

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

export const metadata: Metadata = {
  title: `User`,
}

export const revalidate = 60 * 10 // revalidate every 10 minutes

export default async function Page({
  params,
}: {
  params: { address: string }
}) {
  let schedules: ProcessedSchedule[] = []

  let ensName = null
  try {
    ensName = await client.getEnsName({
      address: params.address as `0x${string}`,
    })
  } catch (e) {
    console.log("error getting ens name", e)
  }

  const vestingContract = getContract({
    address: env.NEXT_PUBLIC_VESTING_CONTRACT as `0x${string}`,
    abi: abi,
    publicClient: client,
  })

  const scheduleCount = await vestingContract.read.holdersVestingScheduleCount([
    params.address as `0x${string}`,
  ])

  for (let i = 0; i < Number(scheduleCount); i++) {
    const schedule: Schedule =
      await vestingContract.read.getVestingScheduleByAddressAndIndex([
        params.address as `0x${string}`,
        BigInt(i),
      ])

    const scheduleId =
      await vestingContract.read.computeVestingScheduleIdForAddressAndIndex([
        params.address as `0x${string}`,
        BigInt(i),
      ])

    const releasableAmount = await vestingContract.read.computeReleasableAmount(
      [scheduleId]
    )

    schedules.push({
      ...schedule,
      ...{ id: scheduleId, releasableAmount, ensName, ensAvatar: null },
    })
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        {ensName ? ensName : truncateAddress(params.address)}
      </h1>
      <div className="mt-4">
        <UserTable schedules={schedules} />
      </div>
    </>
  )
}
