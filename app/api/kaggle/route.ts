import { NextResponse } from "next/server"
import { exec } from "child_process"

export async function POST(req: Request) {
  try {
    const { url, username, apiKey } = await req.json()
    
    if (!url || !username || !apiKey) {
      return NextResponse.json({ error: "Missing required inputs (url, username, apiKey)" }, { status: 400 })
    }

    const scriptPath = "c:\\Users\\madhu\\OneDrive\\Desktop\\SnapML\\backend\\download_kaggle_cli.py"
    const cwd = "c:\\Users\\madhu\\OneDrive\\Desktop\\SnapML\\backend"

    // Escape arguments safely to prevent shell commands injection
    const escapedUrl = url.replace(/["]/g, "")
    const escapedUser = username.replace(/["]/g, "")
    const escapedKey = apiKey.replace(/["]/g, "")

    return new Promise((resolve) => {
      exec(`python "${scriptPath}" "${escapedUrl}" "${escapedUser}" "${escapedKey}"`, { cwd }, (error, stdout, stderr) => {
        if (error) {
          return resolve(NextResponse.json({ error: error.message, stderr }, { status: 500 }))
        }
        try {
          const jsonStart = stdout.indexOf("{")
          const jsonEnd = stdout.lastIndexOf("}")
          if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("No JSON object found in stdout. Output: " + stdout)
          }
          const jsonStr = stdout.substring(jsonStart, jsonEnd + 1)
          const parsed = JSON.parse(jsonStr)
          return resolve(NextResponse.json(parsed))
        } catch (parseErr: any) {
          return resolve(NextResponse.json({ error: `Failed to parse python outputs: ${parseErr.message}`, stdout, stderr }, { status: 500 }))
        }
      })
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Kaggle server error" }, { status: 500 })
  }
}
