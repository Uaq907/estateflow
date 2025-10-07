
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { lookup } from 'mime-types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return new NextResponse('File path is required.', { status: 400 });
  }

  try {
    // Construct an absolute path to the file in the public/uploads directory
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...slug);

    // IMPORTANT: Security check to prevent path traversal attacks
    const publicDir = path.join(process.cwd(), 'public');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(publicDir)) {
      console.error(`Forbidden access attempt to: ${filePath}`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if the file exists and is accessible
    await fs.access(filePath);

    // Read the file content
    const fileBuffer = await fs.readFile(filePath);

    // Determine the MIME type from the file name
    const mimeType = lookup(filePath) || 'application/octet-stream';

    // Create and return the response
    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        // Add a content-disposition header to encourage download for certain types if needed
        // 'Content-Disposition': `attachment; filename="${slug[slug.length - 1]}"`,
      },
    });
  } catch (error: any) {
    // Distinguish between file not found and other errors
    if (error.code === 'ENOENT') {
      console.warn(`File not found: ${slug.join('/')}`);
      return new NextResponse('File not found.', { status: 404 });
    }
    
    console.error(`Error serving file: ${slug.join('/')}`, error);
    return new NextResponse('Internal Server Error.', { status: 500 });
  }
}
