import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';

interface Story {
  id: string;
  prompt: string;
  genre: string;
  text: string;
}

const App = () => {
  const [story, setStory] = useState('');
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Bajka');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  useEffect(() => {
    try {
      const storedStories = localStorage.getItem('savedStories');
      if (storedStories) {
        setSavedStories(JSON.parse(storedStories));
      }
    } catch (e) {
      console.error("Failed to parse saved stories from localStorage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedStories', JSON.stringify(savedStories));
  }, [savedStories]);

  const loadingMessages = [
    "Tworzenie magicznego świata...",
    "Budzenie postaci...",
    "Warzenie fabuły...",
    "Dodawanie odrobiny blasku...",
    "Już prawie gotowe...",
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingMessage(loadingMessages[0]);
      let i = 1;
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const generateStory = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setStory('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Opowiedz mi historię w gatunku ${genre} o ${prompt}. Spraw, by była wciągająca dla młodej publiczności.`
      });
      
      setStory(response.text);

    } catch (err) {
      console.error(err);
      setError('Nie udało się wygenerować opowiadania. Proszę spróbować ponownie.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleSaveStory = () => {
    if (!story) return;
    const newStory: Story = {
      id: Date.now().toString(),
      prompt,
      genre,
      text: story,
    };
    setSavedStories([newStory, ...savedStories]);
    setStory('');
    setPrompt('');
  };

  const handleDeleteStory = (storyId: string) => {
    setSavedStories(savedStories.filter(s => s.id !== storyId));
  };

  const handleExportStories = () => {
    if (savedStories.length === 0) return;

    const fileContent = savedStories
      .map(story => {
        return `Gatunek: ${story.genre}\nTemat: ${story.prompt}\n---\n${story.text}`;
      })
      .join('\n\n====================\n\n');
      
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'opowiadania.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToDrive = () => {
    if (savedStories.length === 0) return;

    const fileContent = savedStories
      .map(story => {
        return `Gatunek: ${story.genre}\nTemat: ${story.prompt}\n---\n${story.text}`;
      })
      .join('\n\n====================\n\n');

    navigator.clipboard.writeText(fileContent).then(() => {
      window.open('https://docs.google.com/document/create', '_blank');
      alert('Twoje opowiadania zostały skopiowane! Wklej je (Ctrl+V) w nowo otwartym dokumencie Google.');
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Nie udało się skopiować opowiadań. Spróbuj użyć opcji eksportu do pliku .txt.');
    });
  };


  const genres = ["Bajka", "Przygoda", "Komedia", "Fantasy", "Science-Fiction"];
  
  const displayedStories = sortOrder === 'newest' ? savedStories : [...savedStories].reverse();

  return (
    <div>
      <h1>Generator Opowiadań</h1>
      <div className="form-group">
        <label htmlFor="genre-select">Wybierz gatunek:</label>
        <select 
          id="genre-select" 
          value={genre} 
          onChange={(e) => setGenre(e.target.value)}
          disabled={loading}
        >
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className="input-container">
        <input
          id="prompt-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Wpisz temat"
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && generateStory()}
        />
        <button onClick={generateStory} disabled={loading || !prompt}>
          {loading ? 'Generowanie...' : 'Wygeneruj Opowiadanie'}
        </button>
      </div>
       {loading && <p className="loader-text">{loadingMessage}</p>}
      <div className="story-output">
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : story ? (
          <>
            <p>{story}</p>
            <button onClick={handleSaveStory} className="save-button">Zapisz opowiadanie</button>
          </>
        ) : !loading ? (
          <p className="placeholder">Twoje opowiadanie pojawi się tutaj.</p>
        ) : null}
      </div>

      <div className="saved-stories-container">
        <div className="saved-stories-header">
          <h2>Zapisane opowiadania</h2>
          <div className="header-controls">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select" title="Sortuj opowiadania">
              <option value="newest">Najnowsze</option>
              <option value="oldest">Najstarsze</option>
            </select>
            <button 
              onClick={handleSaveToDrive}
              disabled={savedStories.length === 0}
              className="gdrive-button"
              title="Skopiuj opowiadania i utwórz nowy dokument Google"
            >
              Zapisz w Google Drive
            </button>
            <button 
              onClick={handleExportStories} 
              disabled={savedStories.length === 0}
              className="export-button"
              title="Eksportuj wszystkie zapisane opowiadania do pliku .txt"
            >
              Eksportuj (.txt)
            </button>
          </div>
        </div>
        {savedStories.length === 0 ? (
          <p className="placeholder">Nie masz jeszcze zapisanych opowiadań.</p>
        ) : (
          <ul>
            {displayedStories.map((saved) => (
              <li key={saved.id} className="saved-story-item">
                <button onClick={() => handleDeleteStory(saved.id)} className="delete-button" title="Usuń opowiadanie">X</button>
                <h3>{saved.genre}: {saved.prompt}</h3>
                <p>{saved.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);