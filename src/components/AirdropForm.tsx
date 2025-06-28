"use client"

import InputField from "@/app/InputField"
import { useState, useMemo, useEffect } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { useChainId, useConfig, useAccount, useWriteContract, useReadContracts } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal} from "@/utils"
import { format } from "path"

interface AirDropFormData {
    tokenAddress: string
    recipients: string
    amounts: string
}

const STORAGE_KEY = "airdrop-form-data"

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")
    const [isClient, setIsClient] = useState(false) // Add this state
    
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total: number = useMemo(() => calculateTotal(amounts), [amounts])
    const {data: hash, isPending, writeContractAsync} = useWriteContract()
    const {data: tokenData} = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "balanceOf",
                args: [account.address],
            },
        ],
        query: {
            enabled: tokenAddress.length == 42,
        }
    })

    // Set client flag and load data only on client
    useEffect(() => {
        setIsClient(true)
        
        // Load saved data from localStorage only on client
        try {
            const savedData = localStorage.getItem(STORAGE_KEY)
            if(savedData) {
                const parsedData: AirDropFormData = JSON.parse(savedData)
                setTokenAddress((parsedData.tokenAddress || "").trim())
                setRecipients((parsedData.recipients || "").trim())
                setAmounts((parsedData.amounts || "").trim())
            }
        } catch(error) {
            console.error("Error loading saved data:", error)
        }
    }, [])

    // Save data to localStorage only on client
    useEffect(() => {
        if (!isClient) return // Don't save on server
        
        const dataToSave: AirDropFormData = {
            tokenAddress,
            recipients,
            amounts
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave)) 
        } catch (error) {
            console.error("Error saving data:", error)
        }
    }, [tokenAddress, recipients, amounts, isClient])

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress){
            alert("No address found, please use a supported chain")
            return 0
        }
        // read from the chain to see if we have approved enough tokens
        // allowance
        const response = await readContract(config, {
           abi: erc20Abi,
           address: tokenAddress as `0x${string}`,
           functionName: "allowance",
           args: [account.address, tSenderAddress as `0x${string}`],
        })

        return response as number
    }

    async function handleSubmit() {
        // 1a. If already approved, move to step 2
        // 1b. Approve our tsender contract to send our tokens
        // 2. Call the airdrop function on the tsender contract
        // 3. Wait for the transaction to be mined
    
        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const approvedAmount = await getApprovedAmount(tSenderAddress)
        console.log("Approved Amount:", approvedAmount)

        if(approvedAmount < total) {
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)],
            })
            const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash
            })
            console.log("Approval Receipt:", approvalReceipt)

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''), // Fixed regex
                    BigInt(total)
                ]
            })
            
        } else {

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''), // Fixed regex
                    BigInt(total)
                ]
            })
        }
    }

    // Helper function to format token amount
    const formatTokenAmount = (amount: number, decimals: number) => {
        return (amount / Math.pow(10, decimals)).toFixed(2);
    }

    // Show loading state during hydration to prevent mismatch
    if (!isClient) {
        return (
            <div className="animate-pulse">
                <div className="h-16 bg-gray-700 rounded mb-4"></div>
                <div className="h-32 bg-gray-700 rounded mb-4"></div>
                <div className="h-32 bg-gray-700 rounded mb-4"></div>
                <div className="h-24 bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
            </div>
        )
    }

    return (
        <div>
            <InputField
                label = "Token Address"
                placeholder = "0x"
                value ={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputField
                label="Recipients"
                placeholder="0x1234...,0x5678..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large ={true}
            />
              <InputField
                label="Amount"
                placeholder="10,50,100,..."
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
                large ={true}
            />

            {/* Token Details Box */}
            <div className="mt-6 p-4 bg-black border border-white rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Token Details</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Token Name:</span>
                        <span className="text-sm text-gray-400 font-semibold">
                            {tokenAddress.length === 42 && tokenData?.[1]?.result 
                                ? String(tokenData[1].result) 
                                : tokenAddress.length === 42 
                                    ? "Loading..." 
                                    : "Enter token address"
                            }
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Amount (Wei):</span>
                        <span className="text-sm text-gray-400 font-mono">
                            {tokenAddress.length === 42 && tokenData?.[0]?.result !== undefined && total
                                ? total
                                : "0"
                            }
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Amount (Tokens):</span>
                        <span className="text-sm text-gray-400 font-semibold">
                            {tokenData?.[0]?.result !== undefined && total
                                ? formatTokenAmount(total, Number(tokenData[0].result))
                                : "0.00"
                            }   
                        </span>
                    </div>
                </div>
            </div>

            <button onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out">
                Send Tokens
            </button>
        </div>
    )
}