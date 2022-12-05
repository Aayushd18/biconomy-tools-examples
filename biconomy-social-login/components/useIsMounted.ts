import { useEffect, useState } from "react";

export function useisMounted() {
  const [ mounted, setMounted ] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}