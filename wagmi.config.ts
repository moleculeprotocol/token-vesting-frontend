import { defineConfig, loadEnv } from "@wagmi/cli"
import { actions, react } from "@wagmi/cli/plugins"

import { abi } from "@/lib/vestingAbi"

export default defineConfig(() => {
  const env = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  })
  return {
    out: "wagmi/generated.ts",
    contracts: [
      {
        name: "TokenVesting",
        abi: abi,
        address: {
          [env.NEXT_PUBLIC_CHAIN_ID]:
            env.NEXT_PUBLIC_VESTING_CONTRACT as `0x${string}`,
        },
      },
    ],
    plugins: [react(), actions()],
  }
})
