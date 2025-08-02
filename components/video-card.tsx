import VideoItemCard from "./video-item-card";

type Props = {
  url: string;
  thumbnail: string;
};

export default function VideoCard({ url, thumbnail }: Props) {
  return (
    <VideoItemCard
      video={{ url, thumbnail }}
      styleClass="w-32 h-48 rounded-lg overflow-hidden bg-black mr-3 relative"
    />
  );
}
