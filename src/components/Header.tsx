import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaGithub } from "react-icons/fa"

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
        <div className="flex items-center gap-4">
            <a
                href="https://github.com/dayvo1/ts-tsender-ui-cu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
            >
                <FaGithub size={24} />
            </a>
            <h1 className="text-2xl font-bold text-white">Dayvo's Token Sender Machine</h1>
        </div>
        <ConnectButton />
    </header>
  )
}