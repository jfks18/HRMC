import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'
 
// Route segment config
export const runtime = 'nodejs' // Changed from 'edge' to support file system
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default async function Icon() {
  // Read the GWC logo file
  const logoPath = path.join(process.cwd(), 'public', 'gwclogo.png')
  const logoBuffer = fs.readFileSync(logoPath)
  const logoBase64 = logoBuffer.toString('base64')
  
  return new ImageResponse(
    (
      // ImageResponse JSX element with your GWC logo
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <img
          src={`data:image/png;base64,${logoBase64}`}
          alt="GWC Logo"
          width="40"
          height="40"
          style={{
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
