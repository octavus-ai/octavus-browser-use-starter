/**
 * File Upload URLs API Route
 *
 * Gets presigned S3 URLs for file uploads. This allows the client
 * to upload files directly to S3 without exposing your API key.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getOctavusClient } from '@/lib/octavus';
import { ApiError } from '@octavus/server-sdk';

const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mediaType: z.string().min(1),
  size: z.number().int().positive(),
});

const uploadUrlsRequestSchema = z.object({
  sessionId: z.string().min(1),
  files: z.array(fileUploadSchema).min(1).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = uploadUrlsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { sessionId, files } = parsed.data;
    const client = getOctavusClient();

    const result = await client.files.getUploadUrls(sessionId, files);
    return Response.json(result);
  } catch (error) {
    console.error('Upload URLs error:', error);

    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
