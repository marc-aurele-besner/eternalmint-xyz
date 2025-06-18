import { networkIdToString } from "@/app/api/utils/network";
import { createAutoDriveApi } from "@autonomys/auto-drive";
import { NetworkId } from '@autonomys/auto-utils';
import { NextRequest, NextResponse } from "next/server";

const detectFileType = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const bytes = [...new Uint8Array(arrayBuffer.slice(0, 4))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // File type magic numbers and corresponding types
  const magicNumbers = {
    "89504E47": "image/png",
    FFD8FFE0: "image/jpeg",
    FFD8FFE1: "image/jpeg",
    FFD8FFE2: "image/jpeg",
    FFD8FFE3: "image/jpeg",
    FFD8FFE8: "image/jpeg",
    FFD8FFDB: "image/jpeg",
    FFD8FFEE: "image/jpeg",
    "47494638": "image/gif",
    "3C3F786D": "image/svg+xml",
    "3C737667": "image/svg+xml",
    "424D": "image/bmp",
    "49492A00": "image/tiff",
    "4D4D002A": "image/tiff",
    "00000100": "image/x-icon",
  };

  for (const [signature, type] of Object.entries(magicNumbers)) {
    if (bytes.startsWith(signature)) {
      return type;
    }
  }

  return "unknown";
};

async function fetchFromAutoDrive(cid: string, networkId: NetworkId) {
  const apiKey = process.env.AUTO_DRIVE_API_KEY;
  if (apiKey == undefined) {
    throw new Error("AUTO_DRIVE_API_KEY is not set");
  }

  const api = createAutoDriveApi({
    apiKey,
    network: networkIdToString(networkId)
  });
  try {
    const stream = await api.downloadFile(cid);
    let file = Buffer.alloc(0);
    for await (const chunk of stream) {
      file = Buffer.concat([file, chunk]);
    }
    return file;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error("CID not found");
  }
}

export async function GET(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const cid = pathname.split("/").slice(3)[1]; // Get CID from URL path
    const network = pathname.split("/").slice(3)[0] as NetworkId; // Get network from URL path
    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    const fileBuffer = await fetchFromAutoDrive(cid, network);
    //@ts-expect-error - fileBuffer is a Buffer
    const fileType = await detectFileType(fileBuffer);

    // Try to parse as JSON first
    try {
      const jsonString = fileBuffer.toString("utf-8");
      const parsedJson = JSON.parse(jsonString);
      return NextResponse.json(parsedJson);
    } catch {
      // If not JSON, treat as file/image
      if (fileType === "image/svg+xml") {
        return new NextResponse(fileBuffer.toString("utf-8"), {
          status: 200,
          headers: {
            "Content-Type": fileType,
          },
        });
      } else {
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": fileType,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
