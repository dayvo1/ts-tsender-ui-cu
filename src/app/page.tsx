"use client"

import HomeContent from "@/components/HomeContent"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"

export default function Home() {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <h1 className="text-4xl font-bold mb-6">Welcome to Dayvo's Token Sender Machine</h1>
        <p className="text-2xl text-white mb-4">Easily send tokens to multiple recipients.</p>
        <p className="text-lg text-white font-bold">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {isConnected ? (
        <div>
          <HomeContent />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <h1 className="text-4xl font-bold mb-6">Welcome to Dayvo's Token Sender Machine</h1>
          <p className="text-2xl text-white mb-4">Easily send tokens to multiple recipients.</p>
          <p className="text-lg text-white font-bold">Connect your wallet to get started...</p>
        </div>
      )}
    </div>
  )
}

