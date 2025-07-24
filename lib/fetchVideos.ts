import axios from 'axios';

export type VideoItem = {
  id: string;
  url: string;
  thumbnail: string;
};

export async function fetchVideosFromGitHub(folder: string): Promise<VideoItem[]> {
  const apiUrl = `https://api.github.com/repos/waqarkhan424/animations-database/contents/${folder}`;

  try {
    const res = await axios.get(apiUrl);
    const data = res.data;

    const videos: VideoItem[] = data
      .filter((item: any) => item.name.endsWith('.mp4'))
      .map((item: any) => {
        const nameWithoutExt = item.name.replace('.mp4', '');
        const thumbnailItem = data.find((f: any) =>
          f.name === `${nameWithoutExt}-thumbnail.jpg`
        );
        return {
          id: `${folder}-${item.name}`,
          url: item.download_url,
          thumbnail: thumbnailItem?.download_url || 'https://via.placeholder.com/150',
        };
      });

    return videos;
  } catch (error) {
    console.error(`Failed to fetch ${folder} videos:`, error);
    return [];
  }
}
