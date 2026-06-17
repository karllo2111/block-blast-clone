import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

type ScorePopup = {
    id: number;
    text: string;
    x: number;
    y: number;
}

const BOARD_SIZE = 8;
type Cell = 0 | 1;
type Grid = Cell[][];
type Shape = Cell[][];

const SHAPES: Shape[] = [
    [[1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1]],
    [[1], [1], [1]],
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    [[1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
    [[1, 1, 1], [0, 1, 0]],
];

//fungsi bantuan
const createEmptyBoard = (): Grid =>
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));

const getRandomShapes = (): (Shape | null)[] => {
    return Array.from({ length: 3 }, () => {
        return SHAPES[Math.floor(Math.random() * SHAPES.length)];
    });
};

const canPlaceShape = (board: Grid, shape: Shape, startR: number, StartC: number): boolean => {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const br = startR + r;
                const bc = StartC + c;
                if (br < 0 || br >= BOARD_SIZE || bc < 0 || bc >= BOARD_SIZE) return false;
                if (board[br][bc] === 1) return false;
            }
        }
    }
    return true;
};

//komponen utama
const App: React.FC = () => {
    const [board, setBoard] = useState<Grid>(createEmptyBoard);
    const [blocks, setBlocks] = useState<(Shape | null)[]>(getRandomShapes);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [hoverPos, setHoverPos] = useState<{ r: number; c: number } | null>(null);
    const [score, setScore] = useState<number>(0);
    const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);

    //derved state
    const isGameOver = (() => {
        if (blocks.length === 0 || blocks.every((b) => b === null)) return false;
        for (const shape of blocks) {
            if (!shape) continue;
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (canPlaceShape(board, shape, r, c)) {
                        return false;
                    }
                }
            }
        }
    })();

    useGSAP(() => {
        if (scorePopups.length > 0) {
            const target = scorePopups[scorePopups.length - 1];

            gsap.fromTo(`.popup-${target.id}`,
                { opacity: 1, y: target.y, scale: 0.8 },
                {
                    opacity: 0,
                    y: target.y - 60,//terbang ke atas sebanyak 60px
                    scale:1.3,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => {
                        setScorePopups((prev) => prev.filter((p) => p.id !== target.id));
                    }
                }
            );
        }
    }, [scorePopups])

    //jika game over dan ada blok yang sedang dipilih, bersihkan pilihan secara otomatis
    if (isGameOver && selectedIndex !== null) {
        setSelectedIndex(null);
    }

    const handleCellclick = (startR: number, startC: number) => {
        if (isGameOver || selectedIndex === null) return;
        const shape = blocks[selectedIndex];
        if (!shape) return;

        if (!canPlaceShape(board, shape, startR, startC)) return;

        const placeAudio = new Audio('/pop.mp3')
        placeAudio.volume = 0.5;
        placeAudio.play().catch(() => {});

        //pakai const buat mutasi isinya via index,bukan menimpa variable
        const newBoard = board.map((row) => [...row]);
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    newBoard[startR + r][startC + c] = 1;
                }
            }
        }

        const rowsToClear = new Set<number>();
        const colsToClear = new Set<number>();

        for (let r = 0; r < BOARD_SIZE; r++) {
            if (newBoard[r].every((cell) => cell === 1)) rowsToClear.add(r);
        }
        for (let c = 0; c < BOARD_SIZE; c++) {
            let isColFull = true;
            for (let r = 0; r < BOARD_SIZE; r++) {
                if (newBoard[r][c] === 0) {
                    isColFull = false;
                    break;
                }
            }
            if (isColFull) colsToClear.add(c);
        }

        if (rowsToClear.size > 0 || colsToClear.size > 0) {
            const audio = new Audio('/break.mp3');
            audio.volume = 0.6;
            audio.play().catch(() => {});
            placeAudio.volume = 0;

            //perkiraan posiis berdasarkan baris dan kolom yang di klik
            const calculatedX = startC * 50 + 40;
            const calculatedY = startR * 50 + 100;

            const totalPoin = (rowsToClear.size + colsToClear.size) * 100;

            setScorePopups((prev) => [
                ...prev,
                { id: Date.now(), text: `+${totalPoin}`, x: calculatedX, y: calculatedY }
            ]);

            if (rowsToClear.size + colsToClear.size >= 2 ) {
                audio.volume= 0;
                const combo = new Audio('/combo.mp3')
                combo.volume = 0.5;
                combo.play().catch(() => {});
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: {y: 0.6}
                })
            }
            
            rowsToClear.forEach((r) => {
                for (let c = 0; c < BOARD_SIZE; c++) newBoard[r][c] = 0;
            });
            colsToClear.forEach((c) => {
                for (let r = 0; r < BOARD_SIZE; r++) newBoard[r][c] = 0;
            });
            setScore((prev) => prev + (rowsToClear.size + colsToClear.size) * 100);
        }

        setBoard(newBoard);
        setScore((prev) => prev + 10);

        const newBlocks = [...blocks];
        newBlocks[selectedIndex] = null;

        if (newBlocks.every((b) => b === null)) {
            setBlocks(getRandomShapes());
        } else {
            setBlocks(newBlocks);
        }

        setSelectedIndex(null);
        setHoverPos(null);
    };
    const getCellClasses = (r: number, c: number): string => {
        const baseClass = "w-10 h-10 sm:w-12 sm:h-12 rounded-md transition-colors duration-150";

        if (board[r][c] === 1) return `${baseClass} bg-blue-500 shadow-[inset_0_-3px_0_rgba(0,0,0,0.3)]`;

        if (selectedIndex !== null && hoverPos !== null && !isGameOver) {
            const shape = blocks[selectedIndex];
            if (shape) {
                const shapeR = r - hoverPos.r;
                const shapeC = c - hoverPos.c;
                if (
                    shapeR >= 0 && shapeR < shape.length &&
                    shapeC >= 0 && shapeC < shape[shapeR].length &&
                    shape[shapeR][shapeC] === 1
                ) {
                    const isValid = canPlaceShape(board, shape, hoverPos.r, hoverPos.c);
                    return isValid
                        ? `${baseClass} bg-green-400/50 border border-green-400`
                        : `${baseClass} bg-red-500/50 border border-red-500`;
                }
            }
        }
        return `${baseClass} bg-slate-700/50 hover:bg-slate-600/50`;
    };

    const restartGame = () => {
        setBoard(createEmptyBoard());
        setBlocks(getRandomShapes());
        setScore(0);
        setSelectedIndex(null);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 font-sans text-white select-none">

            {/* <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 drop-shadow-md">
                BLOCK BLAST
            </h1> */}
            {scorePopups.map((popup) => (
                <div
                key={popup.id}
                className={`popup-${popup.id} absolute font-black text-2xl text-yellow-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] pointer-events-none z-40`}
                style={{ left: `${popup.x}px`}}
                >
                    {popup.text}
                </div>
            ))}
            
            <h2 className="text-2xl font-bold mb-8 text-slate-300">Score: <span className="text-white">{score}</span></h2>

            {isGameOver && (
                <div className="absolute top-1/3 flex flex-col items-center bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-red-500/50 shadow-2xl shadow-red-500/20 z-50 animate-bounce">
                    <h3 className="text-3xl font-bold text-red-500 mb-2">GAME OVER!</h3>
                    <p className="text-slate-300 mb-6">Papan penuh,mentok bos</p>
                    <button
                        onClick={restartGame}
                        className="px-6y py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all"
                    >
                        Main Lagi
                    </button>
                </div>
            )}
            <div
                className={`bg-slate-800 p-2 sm:p-3 rounded-xl shadow-2xl flex flex-col gap-1 sm:gap-1.5 transition-opacity duration-300 ${isGameOver ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                onMouseLeave={() => setHoverPos(null)}
            >
                {board.map((row, r) => (
                    <div key={`r-${r}`} className="flex gap-1 sm:gap-1.5">
                        {row.map((_, c) => (
                            <div
                                key={`c-${c}`}
                                onClick={() => handleCellclick(r, c)}
                                onMouseEnter={() => setHoverPos({ r, c })}
                                className={`${getCellClasses(r, c)} ${selectedIndex !== null ? 'cursor-crosshair' : 'cursor-default'}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex gap-4 sm:gap-6 mt-10 h-28 items-center justify-center">
                {blocks.map((block, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                        <div
                            key={`block-${index}`}
                            onClick={() => {
                                if (block && !isGameOver) {
                                    setSelectedIndex(isSelected ? null : index);
                                }
                            }}
                            className={`
                            flex flex-col gap-1 p-3 rounded-xl transition-all duration-200 min-w-[70px] min-h-[70px] items-center justify-center bg-slate-800/80
                            ${block && !isGameOver ? 'curson-pointer hover:bg-slate-700' : 'cursor-default'}
                            ${isSelected ? 'border-2 border-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'border-2 border-transparent'}
                            ${!block ? 'opacity-0 scale-90' : 'opacity-100'}
                            `}
                        >
                            {block && block.map((r, rIdx) => (
                                <div key={rIdx} className="flex gap-1">
                                    {r.map((c, cIdx) => (
                                        <div
                                        key={cIdx}
                                        className={`w-4 h-4 sm-w-5 sm:5-5 rounded-[4px] ${c === 1 ? 'bg-purple-500 shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]' : 'bg-transparent'}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );

};

export default App;