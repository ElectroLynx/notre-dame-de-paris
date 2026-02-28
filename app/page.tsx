'use client';

import {useState, useMemo, useEffect} from 'react';
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {motion} from 'motion/react';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Data Configuration ---

interface WordConfig {
  id: number;
  word: string; // The vertical word
  clue: string; // The definition
  intersectionChar: string; // The character that is part of CATHEDRALE
  intersectionIndex: number; // The index of that char in the vertical word (0-based)
}

const MYSTERY_WORD = 'CATHEDRALE';

const WORDS: WordConfig[] = [
  {
    id: 1,
    word: 'CLAUDE',
    clue: "Archidiacre de Notre-Dame, alchimiste tourmenté par une passion obsessionnelle.",
    intersectionChar: 'C',
    intersectionIndex: 0,
  },
  {
    id: 2,
    word: 'JEHAN',
    clue: "Frère cadet de l'archidiacre, étudiant dissipé et fêtard.",
    intersectionChar: 'A',
    intersectionIndex: 3, // J-E-H-A-N
  },
  {
    id: 3,
    word: 'TRISTAN',
    clue: "Homme du roi, prévôt des maréchaux, homme cruel et exécuteur des basses œuvres du roi.",
    intersectionChar: 'T',
    intersectionIndex: 0,
  },
  {
    id: 4,
    word: 'VICTORHUGO',
    clue: "L'illustre auteur de ce roman publié en 1831.",
    intersectionChar: 'H',
    intersectionIndex: 6,
  },
  {
    id: 5,
    word: 'ESMERALDA',
    clue: "Jeune bohémienne au grand cœur, accusée de sorcellerie, qui danse sur le parvis.",
    intersectionChar: 'E',
    intersectionIndex: 0, // E-S-M-E-R-A-L-D-A. First E.
  },
  {
    id: 6,
    word: 'QUASIMODO',
    clue: "Le sonneur de cloches bossu, borgne et sourd, d'une grande force.",
    intersectionChar: 'D',
    intersectionIndex: 7, // Q-U-A-S-I-M-O-D-O
  },
  {
    id: 7,
    word: 'NOTREDAME',
    clue: "Le lieu principal du roman, cathédrale gothique de Paris.",
    intersectionChar: 'R',
    intersectionIndex: 3, // N-O-T-R-E-D-A-M-E
  },
  {
    id: 8,
    word: 'AGNES',
    clue: "Le véritable prénom de la bohémienne, révélé par sa mère la recluse.",
    intersectionChar: 'A',
    intersectionIndex: 0,
  },
  {
    id: 9,
    word: 'LOUIS',
    clue: "Le roi de France (XI) qui apparaît dans le roman, calculateur et superstitieux.",
    intersectionChar: 'L',
    intersectionIndex: 0,
  },
  {
    id: 10,
    word: 'PIERRE',
    clue: "Poète et philosophe sans le sou, qui épouse la bohémienne pour la sauver.",
    intersectionChar: 'E',
    intersectionIndex: 5, // P-I-E-R-R-E
  },
];

// --- Grid Logic ---

// Calculate the maximum number of rows needed above and below the intersection line
const MAX_PRE = Math.max(...WORDS.map((w) => w.intersectionIndex));
const MAX_POST = Math.max(...WORDS.map((w) => w.word.length - 1 - w.intersectionIndex));
const TOTAL_ROWS = MAX_PRE + 1 + MAX_POST;
const INTERSECTION_ROW = MAX_PRE; // The row index where the mystery word lies

// Helper to get the character at a specific grid position
function getCharAt(rowIndex: number, colIndex: number): string | null {
  const wordConfig = WORDS[colIndex];
  if (!wordConfig) return null;

  // The intersection character is at INTERSECTION_ROW
  // So the word starts at: INTERSECTION_ROW - wordConfig.intersectionIndex
  const startRow = INTERSECTION_ROW - wordConfig.intersectionIndex;
  const charIndex = rowIndex - startRow;

  if (charIndex >= 0 && charIndex < wordConfig.word.length) {
    return wordConfig.word[charIndex];
  }
  return null;
}

export default function NotreDameMystery() {
  // State for user inputs: key is `${rowIndex}-${colIndex}`
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [validationState, setValidationState] = useState<'idle' | 'checked'>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    const key = `${rowIndex}-${colIndex}`;
    
    // Allow only letters
    if (value && !/^[a-zA-Z]$/.test(value)) return;

    setInputs((prev) => ({
      ...prev,
      [key]: value.toUpperCase(),
    }));
    setValidationState('idle'); // Reset validation on input

    // Auto-focus next cell in the same column (vertical word)
    if (value) {
      const nextRow = rowIndex + 1;
      const nextKey = `${nextRow}-${colIndex}`;
      const nextInput = document.getElementById(`input-${nextKey}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (e.key === 'Backspace' && !inputs[`${rowIndex}-${colIndex}`]) {
      // Move to previous cell if current is empty
      const prevRow = rowIndex - 1;
      const prevKey = `${prevRow}-${colIndex}`;
      const prevInput = document.getElementById(`input-${prevKey}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const resetGrid = () => {
    if (confirm('Voulez-vous vraiment effacer toute la grille ?')) {
      setInputs({});
      setValidationState('idle');
      setScore(null);
    }
  };

  const checkAnswers = () => {
    let correctCount = 0;
    let totalCount = 0;

    for (let c = 0; c < WORDS.length; c++) {
      const word = WORDS[c].word;
      const startRow = INTERSECTION_ROW - WORDS[c].intersectionIndex;
      
      for (let i = 0; i < word.length; i++) {
        const r = startRow + i;
        const key = `${r}-${c}`;
        const inputChar = inputs[key] || '';
        const correctChar = word[i];
        
        if (inputChar === correctChar) {
          correctCount++;
        }
        totalCount++;
      }
    }
    
    const calculatedScore = Math.round((correctCount / totalCount) * 100);
    setScore(calculatedScore);
    setValidationState('checked');
  };

  const revealSolution = () => {
    const newInputs: Record<string, string> = {};
    
    for (let c = 0; c < WORDS.length; c++) {
      const word = WORDS[c].word;
      const startRow = INTERSECTION_ROW - WORDS[c].intersectionIndex;
      
      for (let i = 0; i < word.length; i++) {
        const r = startRow + i;
        const key = `${r}-${c}`;
        newInputs[key] = word[i];
      }
    }
    
    setInputs(newInputs);
    setValidationState('checked');
    setScore(100);
    setIsModalOpen(false);
  };

  // Generate grid rows
  const gridRows = useMemo(() => {
    const rows = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
      const cells = [];
      for (let c = 0; c < WORDS.length; c++) {
        const char = getCharAt(r, c);
        cells.push({
          char,
          rowIndex: r,
          colIndex: c,
          isIntersection: r === INTERSECTION_ROW,
        });
      }
      rows.push(cells);
    }
    return rows;
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 font-serif bg-stone-100 text-slate-900 flex flex-col items-center">
      <header className="mb-8 text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900" style={{ fontFamily: 'var(--font-cinzel)' }}>
          Notre-Dame de Paris
        </h1>
        <p className="text-lg md:text-xl italic text-slate-700">
          Le Mot Mystère par Victor Blosseville
        </p>
        <div className="h-1 w-32 bg-slate-900 mx-auto mt-4" />
      </header>

      <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-xl border border-stone-300 relative overflow-hidden">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-slate-900 rounded-tl-xl opacity-20" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-slate-900 rounded-tr-xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-slate-900 rounded-bl-xl opacity-20" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-slate-900 rounded-br-xl opacity-20" />

        <div className="relative z-10 overflow-x-auto pb-4">
          <div className="min-w-[600px] flex flex-col items-center">
            {/* The Grid */}
            <div 
              className="grid gap-1 mb-8"
              style={{ 
                gridTemplateColumns: `repeat(${WORDS.length}, minmax(40px, 1fr))` 
              }}
            >
              {/* Column Headers (Numbers) */}
              {WORDS.map((word) => (
                <div key={`header-${word.id}`} className="text-center font-bold text-slate-500 mb-2">
                  {word.id}
                </div>
              ))}

              {/* Grid Cells */}
              {gridRows.map((row, rIndex) => (
                row.map((cell, cIndex) => {
                  const key = `${cell.rowIndex}-${cell.colIndex}`;
                  const isActive = cell.char !== null;
                  const isCorrect = validationState === 'checked' && inputs[key] === cell.char;
                  const isWrong = validationState === 'checked' && inputs[key] && inputs[key] !== cell.char;

                  if (!isActive) {
                    return <div key={key} className="w-full aspect-square" />;
                  }

                  return (
                    <div key={key} className="relative w-full aspect-square">
                      <input
                        id={`input-${key}`}
                        type="text"
                        maxLength={1}
                        value={inputs[key] || ''}
                        onChange={(e) => handleInputChange(cell.rowIndex, cell.colIndex, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, cell.rowIndex, cell.colIndex)}
                        className={cn(
                          "w-full h-full text-center text-xl font-bold uppercase border-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent",
                          // Base style
                          "bg-stone-50 border-stone-300 text-slate-800",
                          // Intersection row style
                          cell.isIntersection && "bg-yellow-100 border-yellow-400/50 ring-yellow-200",
                          // Validation styles
                          isCorrect && "bg-green-100 border-green-500 text-green-900",
                          isWrong && "bg-red-100 border-red-500 text-red-900",
                          // Highlight mystery word specifically if solved? No, just keep yellow.
                          cell.isIntersection && !isCorrect && !isWrong && "bg-yellow-200/40"
                        )}
                      />
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={resetGrid}
              className="px-6 py-3 bg-stone-200 text-stone-700 font-bold rounded-lg shadow hover:bg-stone-300 transition-colors text-lg tracking-wide"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Effacer
            </button>
            <button
              onClick={checkAnswers}
              className="px-8 py-3 bg-slate-900 text-stone-100 font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-colors text-lg tracking-wide"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Vérifier mes réponses
            </button>
          </div>
          
          {validationState === 'checked' && score !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-xl font-bold px-6 py-2 rounded-full border",
                score === 100 ? "bg-green-100 text-green-800 border-green-300" : "bg-stone-100 text-stone-800 border-stone-300"
              )}
            >
              Score: {score}% {score === 100 ? "🎉 Excellent !" : ""}
            </motion.div>
          )}
        </div>

        {/* Clues Section */}
        <div className="border-t-2 border-stone-200 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: 'var(--font-cinzel)' }}>
            Définitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORDS.map((word) => (
              <div key={word.id} className="flex gap-4 items-start p-3 rounded-lg hover:bg-stone-50 transition-colors">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-900 text-stone-100 rounded-full font-bold font-mono">
                  {word.id}
                </span>
                <div>
                  <p className="text-slate-800 leading-relaxed">
                    {word.clue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Correction Button */}
      <div className="mt-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-stone-500 underline hover:text-slate-900 transition-colors text-sm"
        >
          Voir la correction
        </button>
      </div>

      <footer className="mt-4 text-stone-500 text-sm text-center">
        <p>Restitution du 02/03/2026 - Notre-Dame de Paris de Victor Hugo - Victor Blosseville</p>
      </footer>

      {/* Correction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-stone-300"
          >
            <h3 className="text-2xl font-bold mb-4 text-slate-900" style={{ fontFamily: 'var(--font-cinzel)' }}>
              Accès à la correction
            </h3>
            <p className="text-slate-600 mb-6">
              Veuillez entrer votre nom pour afficher la solution complète.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-1">
                  Votre nom
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="Ex: Jean Valjean"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={revealSolution}
                  disabled={!userName.trim()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Valider
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

