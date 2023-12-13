"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ConnectKitButton } from "connectkit"
import { format, getUnixTime } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { parseUnits } from "viem"
import { useAccount } from "wagmi"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  beneficiary: z
    .string()
    .min(42, {
      message: "Ethereum address is too short",
    })
    .startsWith("0x", {
      message: "Ethereum address must start with 0x",
    }),
  amount: z.coerce.number().positive().min(0, {
    message: "Amount must be greater than 0",
  }),
  start: z.date({
    required_error: "A start date is required",
  }),
  end: z.date({
    required_error: "An end date is required",
  }),
  cliffMonths: z.coerce.number().int(),
  revokable: z.boolean(),
})

export default function Page() {
  const [cliffSeconds, setCliffSeconds] = useState<number>()
  const [startTimestamp, setStartTimestamp] = useState<number>()
  const [endTimestamp, setEndTimestamp] = useState<number>()
  const [formattedAmount, setFormattedAmount] = useState<bigint>(0n)
  const { isConnected, address } = useAccount()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiary: "0xEfB29bfCF0fd08E20f73869678e9d17848407154",
      amount: 0,
      cliffMonths: 0,
      revokable: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  const amount = form.watch("amount")
  const start = form.watch("start")
  const end = form.watch("end")
  const cliff = form.watch("cliffMonths")

  useEffect(() => {
    if (amount) {
      let amt = amount.toString() as `${number}`
      setFormattedAmount(parseUnits(amt, 18))
    }
  }, [amount])

  useEffect(() => {
    if (start) {
      setStartTimestamp(getUnixTime(start))
    }
  }, [start])

  useEffect(() => {
    if (end) {
      setEndTimestamp(getUnixTime(end))
    }
  }, [end])

  useEffect(() => {
    if (cliff) {
      setCliffSeconds(cliff * 2629746) // months to seconds
    }
  }, [cliff])

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        Create Vesting Schedule
      </h1>
      <div className="rounded-lg border border-slate-400 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="beneficiary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiary</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Ethereum address of the vesting schedule beneficiary.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Start date of the vesting schedule. This date can also be in
                    the past.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    End date of the vesting schedule.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cliffMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliff in months</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormDescription>
                    Tokens are only released after the cliff period.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revokable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Revokable</FormLabel>
                    <FormDescription>
                      Can the vesting schedule be revoked?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isConnected && address ? (
              <Button type="submit">Create Schedule</Button>
            ) : (
              <ConnectKitButton.Custom>
                {({ show }) => {
                  return (
                    <Button type="button" onClick={show}>
                      Connect Wallet
                    </Button>
                  )
                }}
              </ConnectKitButton.Custom>
            )}
          </form>
        </Form>
      </div>
      {/* <div className="mt-8 space-y-1">
        <div>beneficiary: {form.getValues().beneficiary}</div>
        <div>amount: {formattedAmount.toString()}</div>
        <div>
          duration:{" "}
          {endTimestamp && startTimestamp && endTimestamp - startTimestamp}
        </div>
        <div>cliff: {cliffSeconds}</div>
        <div>revokable: {form.getValues().revokable.toString()}</div>
      </div> */}
    </div>
  )
}
