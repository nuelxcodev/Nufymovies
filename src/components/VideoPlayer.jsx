export default function VideoPlayer({ videoId }) {
  if (!videoId) {
    return (
      <div className="w-full md:w-1/2 flex items-center justify-center h-[250px] md:h-[400px] bg-neutral-200 dark:bg-neutral-800 text-center p-4">
        <p>No trailer available for this movie yet.</p>
      </div>
    );
  }
  return (
    <div className="w-full md:w-1/2">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Trailer"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-[250px] md:h-[400px] border-0"
      />
    </div>
  );
}
