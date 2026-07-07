import { networkIdToString } from "@/app/api/utils/network";
import {
  getImageSizeErrorMessage,
  getImageTypeErrorMessage,
  isValidImageSize,
  isValidImageType,
} from "@/config/app";
import { MINT_ABI } from "@/constants/contract";
import { createAutoDriveApi } from "@autonomys/auto-drive";
import { NetworkId } from '@autonomys/auto-utils';
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { NextRequest, NextResponse } from "next/server";

const urlFromCid = (cid: string) =>
  `${process.env.NEXT_PUBLIC_HOST}/api/cid/${process.env.NEXT_PUBLIC_NETWORK}/${cid}`;

export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
  if (!process.env.AUTO_DRIVE_API_KEY)
    return NextResponse.json(
      { message: "AutoDrive API key is not set" },
      { status: 500 }
    );
  if (!process.env.NEXT_PUBLIC_HOST)
    return NextResponse.json({ message: "Host is not set" }, { status: 500 });
  if (!process.env.NEXT_PUBLIC_NETWORK)
    return NextResponse.json(
      { message: "Network is not set" },
      { status: 500 }
    );
  if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
    return NextResponse.json(
      { message: "Contract address is not set" },
      { status: 500 }
    );
  if (!process.env.PRIVATE_KEY)
    return NextResponse.json(
      { message: "Private key is not set" },
      { status: 500 }
    );

  try {
    const formData = await req.formData();
    console.log("Form Data:", formData);

    const name = formData.get("name") as string;
    const supply = parseInt(formData.get("supply") as string, 10);
    const description = formData.get("description") as string;
    const externalLink = formData.get("externalLink") as string;
    const media = formData.get("media") as File | null;
    const creator = formData.get("creator") as string;

    console.log("Received Data:", {
      name,
      supply,
      description,
      externalLink,
      media,
    });

    let mediaUrl = "";

    if (!media)
      return NextResponse.json(
        { message: "Media is required" },
        { status: 400 }
      );
    if (!isValidImageType(media.type))
      return NextResponse.json(
        { message: getImageTypeErrorMessage() },
        { status: 400 }
      );
    if (!isValidImageSize(media.size))
      return NextResponse.json(
        { message: getImageSizeErrorMessage() },
        { status: 400 }
      );

    const arrayBuffer = await media.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const driveClient = createAutoDriveApi({
      apiKey: process.env.AUTO_DRIVE_API_KEY, 
      network: networkIdToString(process.env.NEXT_PUBLIC_NETWORK as NetworkId)
    });

    const uploadedFileCid = await driveClient.uploadFile(
      {
        read: async function* () {
          yield buffer;
        },
        name: media.name,
        mimeType: media.type,
        size: buffer.length,
      },
      {}
    );

    console.log("Final Upload Response:", uploadedFileCid);

    mediaUrl = urlFromCid(uploadedFileCid?.toString() || "");

    const metadata = {
      description,
      external_url: externalLink,
      image: mediaUrl,
      name,
      attributes: [],
    };
    console.log("Metadata:", metadata);

    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const metadataUploadCid = await driveClient.uploadFile(
      {
        read: async function* () {
          yield metadataBuffer;
        },
        name: "metadata.json",
        mimeType: "application/json",
        size: metadataBuffer.length,
      },
      {}
    );

    const cid = metadataUploadCid?.toString() || "";

    console.log("Final Upload Response:", metadataUploadCid);

    // Now we need to mint the NFT

    const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_ENDPOINT);
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      MINT_ABI,
      wallet
    );
    const tx = await contract.mint(creator, cid, supply);

    const receipt = await tx.wait();
    console.log("Receipt:", receipt);

    return NextResponse.json(
      {
        message: "NFT created successfully",
        mediaUrl,
        txHash: tx.hash,
        cids: {
          image: uploadedFileCid?.toString(),
          metadata: metadataUploadCid?.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
