'use server';

import { list } from '@vercel/blob';

export async function fetchAnimationUrls(folder: string) {
    const { blobs } = await list({ prefix: `${folder}/` });
    // Return array of public URLs
    return blobs.map(b => b.url);
}



