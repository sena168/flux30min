'use client';

import React, { useEffect, useState, MouseEvent } from 'react';

type HistoryItem = {
  id: string;
  prompt: string;
  imageUrl: string; // Blob URL
  timestampLabel: string;
};

const MAX_HISTORY = 30;

async function dataUrlToObjectUrl(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const [contextVisible, setContextVisible] = useState(false);
  const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );

  // Hide context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextVisible(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  function setStatusMessage(message: string | null, isError = false) {
    setStatus(message);
    setStatusError(isError);
  }

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) {
      alert('Please enter a prompt first.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Calling FLUX endpoint…', false);
    setCurrentImageUrl(null);
    setCurrentImageId(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.error || `Error from API (${res.status} ${res.statusText})`;
        setStatusMessage(msg, true);
        setIsLoading(false);
        return;
      }

      const data: { id: string; image: string } = await res.json();
      const objectUrl = await dataUrlToObjectUrl(data.image);

      setCurrentImageUrl(objectUrl);
      setCurrentImageId(data.id);
      setStatusMessage('Done.', false);
      setIsLoading(false);

      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const timestampLabel = `Saved at ${time}`;

      setHistoryItems((prev) => {
        const next: HistoryItem[] = [
          {
            id: data.id,
            prompt: trimmed,
            imageUrl: objectUrl,
            timestampLabel,
          },
          ...prev,
        ];

        if (next.length > MAX_HISTORY) {
          const removed = next.pop();
          if (removed) {
            URL.revokeObjectURL(removed.imageUrl);
          }
        }

        return next;
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Failed to reach /api/generate.', true);
      setIsLoading(false);
    }
  }

  function handleCardClick(e: MouseEvent<HTMLDivElement>, id: string): void {
    e.preventDefault();
    e.stopPropagation();
    setSelectedHistoryId(id);

    const x = e.pageX;
    const y = e.pageY;
    setContextPosition({ x, y });
    setContextVisible(true);
  }

  function downloadHistoryItem(id: string | null) {
    if (!id) return;
    const item = historyItems.find((h) => h.id === id);
    if (!item) return;

    const a = document.createElement('a');
    a.href = item.imageUrl; // Blob URL, no FLUX call
    a.download = `${item.id}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function deleteHistoryItem(id: string | null) {
    if (!id) return;

    setHistoryItems((prev) => {
      const item = prev.find((h) => h.id === id);
      if (item) {
        URL.revokeObjectURL(item.imageUrl);
      }
      return prev.filter((h) => h.id !== id);
    });
  }

  const showPlaceholder = !currentImageUrl;

  return (
    <div className='page'>
      <div className='app'>
        <div className='header'>
          <div className='title-block'>
            <div className='title'>
              <img src="/satujam.png" alt="Satu Jam Saja Logo" width="32" height="32" style={{verticalAlign: 'middle', marginRight: '10px'}} />
              Satu Jam Saja
            </div>
            <div className='subtitle'>
              one hour only free generator, now or never!
            </div>
            <div className='subtitle-small'>
              follow my github for more:{' '}
              <a
                href='https://github.com/sena168'
                target='_blank'
                rel='noopener noreferrer'
              >
                @sena168
              </a>
            </div>
          </div>
          <div className='badge'>Endpoint: Modal · FLUX.1 [schnell]</div>
        </div>

        <div className='input-section'>
          <label htmlFor='prompt'>Prompt</label>
          <textarea
            id='prompt'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Example: ultra-detailed cinematic shot of a cyberpunk Jakarta street market at night, neon lights, rain, shallow depth of field'
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                void handleGenerate();
              }
            }}
          />

          <div className='controls'>
            <div className='controls-left'>
              <div className='hint'>
                Tip: Press Ctrl+Enter (or ⌘+Enter) to generate.
              </div>
              <div className='hint'>
                Every generation is auto-saved below. Click a history image for
                actions (Save / Delete).
              </div>
            </div>
            <div className='buttons'>
              <button
                id='generateBtn'
                onClick={() => void handleGenerate()}
                disabled={isLoading}
              >
                <span
                  className='spinner'
                  id='spinner'
                  style={{ display: isLoading ? 'inline-block' : 'none' }}
                />
                <span id='buttonText'>
                  {isLoading ? 'Generating…' : 'Generate'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className='output' id='output'>
          {showPlaceholder && (
            <div className='placeholder' id='placeholder'>
              Your FLUX image will appear here. <br />
              Add a prompt and hit <strong>Generate</strong>.
            </div>
          )}
          {!showPlaceholder && currentImageUrl && (
            <img
              id='resultImage'
              src={currentImageUrl}
              alt={currentImageId ?? 'Generated image'}
            />
          )}
          {status && (
            <div className={`status ${statusError ? 'error' : ''}`} id='status'>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* HISTORY UNDER MAIN CONTAINER */}
      <div className='history' id='history'>
        <div className='history-header'>
          <span className='history-title'>History</span>
          <span className='history-subtitle'>
            Keeps last 30 images (this session only, each with UUID label)
          </span>
        </div>
        <div className='history-grid' id='historyGrid'>
          {historyItems.length === 0 ? (
            <div className='history-empty' id='historyEmpty'>
              No images yet. Every new generation is automatically saved here.
            </div>
          ) : (
            historyItems.map((item) => {
              const shortId = item.id.slice(0, 8);
              return (
                <div
                  key={item.id}
                  className='history-item'
                  onClick={(e) => handleCardClick(e, item.id)}
                >
                  <img src={item.imageUrl} alt={`Generated ${item.id}`} />
                  <div className='history-prompt'>
                    {item.prompt.length > 120
                      ? item.prompt.slice(0, 117) + '…'
                      : item.prompt}
                  </div>
                  <div className='history-meta'>
                    {item.timestampLabel} · UUID: {shortId}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className='footer'>
        <a
          href='https://github.com/sena168'
          target='_blank'
          rel='noopener noreferrer'
        >
          github:sena168
        </a>
      </div>

      {/* Context menu */}
      <div
        className='context-menu'
        style={{
          display: contextVisible ? 'flex' : 'none',
          left: contextPosition.x,
          top: contextPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            downloadHistoryItem(selectedHistoryId);
            setContextVisible(false);
          }}
        >
          Save
        </button>
        <button
          className='danger'
          onClick={() => {
            deleteHistoryItem(selectedHistoryId);
            setContextVisible(false);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
