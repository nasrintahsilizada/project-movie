export default function ResultView({ movie, explanation, onRestart }) {
  return (
    <div className="p-6 max-w-lg mx-auto text-center card--large">
      <h1 className="movie-title text-3xl font-bold mb-2">
        {movie.title} <span className="movie-meta">({movie.releaseYear})</span>
      </h1>
      <p className="movie-content mb-4">{movie.content}</p>
      <p className="movie-explanation">💡 {explanation}</p>
      <button
        onClick={onRestart}
        className="btn-primary w-full"
      >
        Go Again 🔁
      </button>
    </div>
  );
}
