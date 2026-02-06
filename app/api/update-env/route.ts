import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key format. Must start with "sk-"',
        },
        { status: 400 }
      )
    }

    // Update .env file
    const envPath = join(process.cwd(), '.env')
    const envContent = `# Environment variables for Next.js
# Updated via API

LYZR_API_KEY=${apiKey}
VITE_LYZR_API_KEY=${apiKey}
`

    await writeFile(envPath, envContent, 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully. Please restart the server.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update API key',
      },
      { status: 500 }
    )
  }
}
