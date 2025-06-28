"use client"
import AirdropForm from "./AirdropForm"
import { useState, useEffect } from "react"

import { useAccount } from "wagmi"

export default function HomePage() {
    const  { isConnected } = useAccount()

    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) return null
    
    if (isConnected) {
        return (
            <AirdropForm />
        ) 
    } else {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black">
                <h1 className="text-4xl font-bold mb-6">Welcome to Dayvo's Token Sender Machine</h1>
                <p className="text-2xl text-white mb-4">Easily send tokens to multiple recipients.</p>
                <p className="text-lg text-white font-bold">Connect your wallet to get started...</p>
            </div>
        )
    } 
}
