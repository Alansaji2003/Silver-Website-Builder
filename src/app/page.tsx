"use client"

import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"

const Page = () =>{
  const trpc = useTRPC();
  trpc.hello.queryOptions({
    text:"hello"
  })
  return(
    <div >
      <Button>
        Click Me
      </Button>
    </div>
  )
}

export default Page