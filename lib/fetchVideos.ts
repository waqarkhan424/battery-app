import axios from 'axios';

export type VideoItem = {
    id: string;
    url: string;
};

export async function fetchVideosFromGitHub(folder: string): Promise<VideoItem[]> {
    const apiUrl = `https://api.github.com/repos/waqarkhan424/animations-database/contents/${folder}`;

    try {
        const res = await axios.get(apiUrl);
        const data = res.data;

        const videos: VideoItem[] = data
            .filter((item: any) => item.name.endsWith('.mp4'))
            .map((item: any) => ({
                id: `${folder}-${item.name}`,
                url: item.download_url,
            }));

        return videos;
    } catch (error) {
        console.error(`Failed to fetch ${folder} videos:`, error);
        return [];
    }
}
