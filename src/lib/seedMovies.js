import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import movies from './content.js';
import dotenv from 'dotenv';

dotenv.config();

const openaiKey = process.env.VITE_OPENAI_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!openaiKey || !supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables');
}

const openai = new OpenAI({ apiKey: openaiKey });
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedMovies() {
  for (const movie of movies) {
    try {
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: movie.content,
      });
      const embedding = embeddingRes.data[0].embedding;

      await supabase.from('movies').insert({
        title: movie.title,
        release_year: movie.releaseYear,
        content: movie.content,
        embedding: embedding,
      });

      console.log(`✓ Inserted: ${movie.title}`);
    } catch (err) {
      console.error(`✗ Failed to insert ${movie.title}:`, err.message);
    }
  }
  console.log('Seeding complete!');
}

seedMovies();
