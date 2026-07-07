"use client";

import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { Routes } from "../constants/routes";
import { truncateAddress } from "../utils/format";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected } = useAccount();

  const font = "font-manrope font-extrabold";
  const hover =
    "text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-red-500 hover:bg-clip-text hover:text-transparent";
  const active =
    "bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent";

  const activeOrHoverClass = useCallback(
    (route: Routes) => `${font} ${pathname === route ? active : hover}`,
    [pathname]
  );

  return (
    <header className="flex justify-between items-center mb-8">
      <Link
        href={Routes.HOME}
        aria-label="Eternal Mint — go to home"
        className="flex items-center"
      >
        <Image
          src="/images/EternalMint-LogoWithText.png"
          alt="Eternal Mint — home"
          width={255}
          height={60}
          sizes="255px"
          priority
        />
      </Link>
      <nav
        aria-label="Primary"
        className="flex gap-6 items-center"
      >
        <Link href={Routes.HOME} className={activeOrHoverClass(Routes.HOME)}>
          Home
        </Link>
        <Link
          href={Routes.CREATE}
          className={activeOrHoverClass(Routes.CREATE)}
        >
          Create Eternal NFTs
        </Link>
        <Link
          href={Routes.BROWSE}
          className={activeOrHoverClass(Routes.BROWSE)}
        >
          Browse NFTs
        </Link>
        {isConnected && (
          <Link
            href={Routes.MY_NFTS}
            className={activeOrHoverClass(Routes.MY_NFTS)}
          >
            My NFTs
          </Link>
        )}
        {address ? (
          <button
            type="button"
            onClick={openAccountModal}
            className="px-3 py-2 font-manrope font-extrabold bg-gradient-to-r from-[#1E58FC] via-[#D914E4] to-[#F10419] text-white rounded-sm hover:bg-green-700 transition"
          >
            {truncateAddress(address)}
          </button>
        ) : (
          <button
            type="button"
            onClick={openConnectModal}
            className="px-3 py-2 font-manrope font-extrabold bg-gradient-to-r from-[#1E58FC] via-[#D914E4] to-[#F10419] text-white rounded-sm hover:bg-green-700 transition"
          >
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );
};