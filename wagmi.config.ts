import { defineConfig /* loadEnv */ } from "@wagmi/cli"
import { actions, react } from "@wagmi/cli/plugins"

import { abi } from "@/lib/vestingAbi"

export default defineConfig(() => {
  // const env = loadEnv({
  //   mode: process.env.NODE_ENV,
  //   envDir: process.cwd(),
  // })
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
