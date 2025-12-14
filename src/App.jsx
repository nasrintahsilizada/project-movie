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
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (answers) => {
    setLoading(true);

    const userText = `
      Favorite movie: ${answers.favorite}.
      Mood: ${answers.mood}.
      Tone: ${answers.tone}.
    `;

    try {
        // If OpenAI or Supabase are not configured, fall back to a simple local matcher
        // robust normalize: remove diacritics, non-alphanumeric and lowercase
        const normalize = (s) =>
          (s || "")
            .toString()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/[^a-z0-9]/gi, "")
            .toLowerCase();

        if (!openai || !supabase) {
          // Try to find a movie by normalized match, then substring, otherwise pick the first movie
          const favNorm = normalize(answers.favorite);
          let candidate;
          if (favNorm) {
            candidate = movies.find((m) => normalize(m.title) === favNorm);
            if (!candidate) {
              candidate = movies.find((m) => normalize(m.title).includes(favNorm));
            }
            if (!candidate) {
              candidate = movies.find((m) => favNorm.includes(normalize(m.title)));
            }
          }
          const movie = candidate || movies[0];
          const explanation = `Matched locally: ${movie.title} — recommended based on your input.`;
          setResult({ movie, explanation });
        } else {
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

          if (error) {
            console.error('Supabase error:', error);
            setErrorMsg(error.message || 'Supabase RPC error');
            return;
          }

          if (!matches || matches.length === 0) {
            // No vector match from Supabase — try local fallback matching using the user's favorite title
            const favNorm = normalize(answers.favorite || "");
            let candidate;
            if (favNorm) {
              candidate = movies.find((m) => normalize(m.title) === favNorm);
              if (!candidate) candidate = movies.find((m) => normalize(m.title).includes(favNorm));
              if (!candidate) candidate = movies.find((m) => favNorm.includes(normalize(m.title)));
            }
            if (candidate) {
              const explanation = `Matched locally: ${candidate.title} — no vector match found, falling back to title search.`;
              setResult({ movie: candidate, explanation });
              return;
            }

            setErrorMsg('No matching movies found. Try different preferences.');
            return;
          }

          const best = matches[0];
          // Try normalized exact match first, then substring fallbacks in both directions
          const bestTitle = best.title || best.name || best.movie_title || "";
          const bestNorm = normalize(bestTitle);
          let movie = movies.find((m) => normalize(m.title) === bestNorm);
          if (!movie) {
            movie = movies.find((m) => normalize(m.title).includes(bestNorm));
          }
          if (!movie) {
            movie = movies.find((m) => bestNorm.includes(normalize(m.title)));
          }
          if (!movie) {
            // Helpful debug information to console to aid diagnosis
            console.warn("No local movie match for Supabase best result:", { best, bestTitle, bestNorm });
            console.warn("Available titles:", movies.map((m) => m.title));
            throw new Error(`Movie "${bestTitle}" not found in local library`);
          }

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
        }
    } catch (err) {
      console.error("App error:", err);
      const msg = err?.message || String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (errorMsg) {
    return (
      <div className="p-6 max-w-lg mx-auto card--large">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <pre style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>{errorMsg}</pre>
        <p className="hint">Check the browser console for more details.</p>
        <button onClick={() => { setErrorMsg(null); setResult(null); }} className="btn-primary w-full mt-4">Try Again</button>
      </div>
    );
  }

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
