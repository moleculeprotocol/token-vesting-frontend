import "dotenv/config"

import { defineConfig, loadEnv } from "@wagmi/cli"
import { actions, react } from "@wagmi/cli/plugins"

import { env } from "@/env.mjs"
import { abi } from "@/lib/vestingAbi"

export default defineConfig(() => {
  const nEnv = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  })

  console.log("chain id", nEnv.NEXT_PUBLIC_CHAIN_ID)
  console.log("contract address", nEnv.NEXT_PUBLIC_VESTING_CONTRACT)

  console.log("t3 chain", env.NEXT_PUBLIC_CHAIN_ID)
  console.log("t3 contract address", env.NEXT_PUBLIC_VESTING_CONTRACT)

  return {
    out: "wagmi/generated.ts",
    contracts: [
      {
        name: "TokenVesting",
        abi: abi,
        address: {
          1: "0x4f55eDFfd4e9325577D4C8Dde6F15782CEfd6517" as `0x${string}`,
        },
      },
    ],
    plugins: [react(), actions()],
  }
})
