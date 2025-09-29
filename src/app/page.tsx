"use client"

import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const Page = () =>{
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess:() => {
        toast.success("Background job started")
    }
  }))
  return(
    <div >
      <Button onClick={() => invoke.mutate({text: "Alan Saji yayayay"})}>
        Click Me
      </Button>
    </div>
  )
}

export default Page