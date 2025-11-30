// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


import { useState } from "react";
import { openai, supabase } from "./lib/config";
import movies from "./lib/content";
import QuestionView from "./component/QuestionView";
import ResultView from "./component/ResultView";



export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (answers) => {
    setLoading(true);

    const userText = `
      Favorite movie: ${answers.favorite}.
      Mood: ${answers.mood}.
      Tone: ${answers.tone}.
    `;

    try {
      // 1️⃣ Create embedding for user
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: userText,
      });
      const [{ embedding }] = embeddingRes.data;

      // 2️⃣ Query Supabase for the best match
      const { data: matches, error } = await supabase.rpc("match_movies", {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 1,
      });

      if (error) throw error;
      if (!matches || matches.length === 0) throw new Error("No matching movies found. Try different preferences.");
      const best = matches[0];
      const movie = movies.find((m) => m.title === best.title);
      
      if (!movie) throw new Error(`Movie "${best.title}" not found in library`);

      // 3️⃣ Generate explanation using GPT
      const explanationRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly movie recommender. Explain briefly why this movie is a good match for the user.",
          },
          {
            role: "user",
            content: `User input: ${userText}\nRecommended movie: ${movie.title} (${movie.releaseYear}) - ${movie.content}`,
          },
        ],
      });

      const explanation = explanationRes.choices[0].message.content;
      console.log(explanation)

      setResult({ movie, explanation });
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return result ? (
    <ResultView
      movie={result.movie}
      explanation={result.explanation}
      onRestart={() => setResult(null)}
    />
  ) : (
    <QuestionView onSubmit={handleSubmit} loading={loading} />
  );
}
