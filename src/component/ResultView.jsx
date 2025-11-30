export default function ResultView({ movie, explanation, onRestart }) {
  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2">
        {movie.title} ({movie.releaseYear})
      </h1>
      <p className="text-gray-700 mb-4">{movie.content}</p>
      <p className="italic text-lg mb-6">💡 {explanation}</p>
      <button
        onClick={onRestart}
        className="bg-green-500 text-white rounded w-full p-3 font-bold hover:bg-green-600"
      >
        Go Again 🔁
      </button>
    </div>
  );
}
