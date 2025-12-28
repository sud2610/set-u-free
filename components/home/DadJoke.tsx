'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

// Free Dad Joke API - icanhazdadjoke.com
const DAD_JOKE_API = 'https://icanhazdadjoke.com/';

// Fallback jokes in case API fails (Australian-friendly dad jokes)
const fallbackJokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  "What do you call a fake noodle? An impasta!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "I used to hate facial hair, but then it grew on me.",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why did the bicycle fall over? Because it was two-tired!",
  "I'm on a seafood diet. I see food and I eat it!",
  "What do you call a kangaroo that's lazy? A pouch potato!",
  "Why did the koala get the job? He had all the right koalifications!",
  "What's a kangaroo's favorite year? A leap year!",
  "Why do Australians never lose at poker? Because they always have a koala-ty hand!",
  "I tried to catch some fog earlier. I mist.",
  "Why don't skeletons fight each other? They don't have the guts!",
];

export function DadJoke() {
  const [joke, setJoke] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJoke = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await fetch(DAD_JOKE_API, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setJoke(data.joke);
      } else {
        // Use fallback joke
        const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        setJoke(randomJoke);
      }
    } catch (error) {
      // Use fallback joke on error
      const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      setJoke(randomJoke);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJoke();
    
    // Auto-refresh joke every 45 seconds
    const interval = setInterval(() => {
      fetchJoke();
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchJoke]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchJoke(true);
    }
  };

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
        <span className="text-lg">😄</span>
        <div className="h-3 bg-white/50 rounded w-40 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 max-w-full sm:max-w-xl">
      <span className="text-lg flex-shrink-0">😄</span>
      <span className="text-sm font-medium text-gray-800 leading-snug">
        {joke}
      </span>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/40 text-gray-700 transition-all duration-200 disabled:opacity-50 group"
        title="Get another joke 😉"
        aria-label="Get another dad joke"
      >
        <RefreshCw 
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
          }`} 
        />
      </button>
    </div>
  );
}

