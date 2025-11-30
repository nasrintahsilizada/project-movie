import { useState } from "react";

export default function QuestionView({ onSubmit, loading }) {
  const [answers, setAnswers] = useState({
    favorite: "",
    mood: "New",
    tone: "Fun",
  });

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">🎬 PopChoice</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">
            What’s your favorite movie and why?
          </label>
          <input
            type="text"
            name="favorite"
            value={answers.favorite}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-semibold">
            Are you in the mood for something new or classic?
          </label>
          <select
            name="mood"
            value={answers.mood}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option>New</option>
            <option>Classic</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">
            Do you want to have fun or something more serious?
          </label>
          <select
            name="tone"
            value={answers.tone}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option>Fun</option>
            <option>Serious</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white rounded w-full p-3 font-bold hover:bg-green-600"
        >
          {loading ? "Finding your movie..." : "Find My Movie 🎥"}
        </button>
      </form>
    </div>
  );
}
