// src/lib/config.js
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";



// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = 'https://ipvazlvoyochgimwkhoq.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY
// const supabase = createClient(https://ipvazlvoyochgimwkhoq.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdmF6bHZveW9jaGdpbXdraG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTA2NDgsImV4cCI6MjA3ODc4NjY0OH0.sr-2D_ZHQPaRRQ-wrD8388_vce5ckS8d9kuFf_ZoCMI)


const getEnv = (key) => {
  return typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env[key]
    : process.env[key];
};

const openaiKey = getEnv('VITE_OPENAI_API_KEY');
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!openaiKey) {
  console.warn("VITE_OPENAI_API_KEY missing in environment; OpenAI client not initialized.");
}

export const openai = openaiKey
  ? new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true })
  : null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables missing; Supabase client not initialized.");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isFallback = !openai || !supabase;

