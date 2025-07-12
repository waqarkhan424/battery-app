'use server';

import { list } from '@vercel/blob';

export async function fetch_animation_urls(folder: string) {
    const { blobs } = await list({ prefix: `${folder}/` });
    // Return array of public URLs
    return blobs.map(b => b.url);
}



