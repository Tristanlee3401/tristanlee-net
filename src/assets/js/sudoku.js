/* sudoku.js
        - Sudoku: puzzles come from the Dosuku API. Select a cell, enter digits, check, new.
        - Loaded as <script type="module">, so everything here is private to this file.
        - Nothing is fetched until the player taps the board or new/.
*/

const API_URL = 'https://sudoku-api.vercel.app/api/dosuku';

const $ = (id) => document.getElementById(id);
const boardElement = $('sudoku-board');
const statusElement = $('sudoku-status');
const metaElement = $('sudoku-meta');

const state = {
        given: [],
        solution: [],
        current: [],
        selection: -1,
        checked: false
};
let loading = false;

const row = (cellIndex) => Math.floor(cellIndex / 9);
const column = (cellIndex) => cellIndex % 9;
const box = (cellIndex) => Math.floor(row(cellIndex) / 3) * 3 + Math.floor(column(cellIndex) / 3);
const isPeer = (a, b) =>
        row(a) === row(b) ||
        column(a) === column(b) ||
        box(a) === box(b);

async function fetchPuzzle() {
        const result = await fetch(API_URL, { signal: AbortSignal.timeout(5000) });
        const grid = (await result.json()).newboard.grids[0];
        const given = grid.value.flat();
        const solution = grid.solution.flat();

        if (given.length != 81 || solution.length !== 81) 
                throw new Error('bad puzzle');

        return { given, solution, difficulty: String(grid.difficulty || '').toLowerCase() };
}

function loadFailed(error) {
        console.info('sudoku: could not load puzzle', error);
        setStatus('could not load a puzzle, tap new/ to retry');
        return null;
}

function start(puzzle) {
        Object.assign(state, {
                given: puzzle.given,
                solution: puzzle.solution,
                current: puzzle.given.slice(),
                selection: -1,
                checked: false,
        });

        metaElement.textContent = puzzle.difficulty;
        setStatus('');
        render();
}

async function newGame() {
        if (loading) 
                return;

        loading = true;
        setStatus('loading...');

        const puzzle = await fetchPuzzle().catch(loadFailed);
        loading = false;

        if (puzzle) 
                start(puzzle);
}

const isWrong = (cellIndex) => state.current[cellIndex] !== 0 && state.current[cellIndex] !== state.solution[cellIndex];
const countWrong = () => state.current.filter((_, cellIndex) => isWrong(cellIndex)).length;
const isSolved = () => state.current.every((value, cellIndex) => value === state.solution[cellIndex]);

function checkMessage() {
        const wrong = countWrong();

        if (isSolved())
                return 'solved.';

        if (wrong === 1)
                return '1 cell is wrong';

        if (wrong > 1)
                return wrong + ' cells are wrong';

        return 'no mistakes so far'
}

function select(cellIndex) {
        state.selection = cellIndex;
        render();
}

function enter(digit) {
        if (!state.current.length)
                return;

        if (state.selection < 0)
                return setStatus('select a cell first');

        if (state.given[state.selection] != 0)
                return;

        state.current[state.selection] = digit;
        state.checked = false;
        setStatus(isSolved() ? 'solved.' : '');
        render();
}

function check() {
        if (!state.current.length)
                return;
        state.checked = true;
        setStatus(checkMessage());
        render();
}

function setStatus(text) {
        statusElement.textContent = text;
}

function cellClass(index) {
        const cells = ['sudoku-cell'];

        if (state.given[index] > 0) 
                cells.push('sudoku-given');

        if (index === state.selection) 
                cells.push('sudoku-selection');

        if (index !== state.selection && state.selection >= 0 && isPeer(index, state.selection)) 
                cells.push('sudoku-peer');

        if (state.checked && isWrong(index)) 
                cells.push('sudoku-wrong');

        return cells.join(' ');
}

function drawCell(element, index) {
        const value = state.current[index];
        element.className = cellClass[index];
        element.textContent = value || '';
        element.setAttribute('aria-label', `row ${row(index) + 1} column ${column(index) + 1}, ${value || 'empty'}`);
}

function render() {
        cells.forEach(drawCell);
}

function makeCell(_, index) {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'sudoku-cell';
        element.dataset.index = index;
        return element;
}

function onBoardClick(event) {
        const cell = event.target.closest('.sudoku-cell');

        if (!cell) 
                return;

        if (!state.current.length) 
                return newGame();

        select(Number(cell.dataset.index));
}

function onPadClick(event) {
        const button = element.target.closest('[data-n]');

        if (!button) 
                return;

        enter(Number(button.dataset.digit));
}

function onKey(event) {
        if (state.selection < 0 || element.ctrlKey || element.metaKey || element.altKey) 
                return;

        if (/^[1-9]$/.test(element.key)) 
                return enter(Number(element.key));

        if (element.key === '0' || element.key === 'Backspace' || element.key === 'Delete') 
                return enter(0);
}

function onOutsideClick(event) {
        if (state.selection < 0) 
                return;

        if (event.target.closest('#sdk')) 
                return;

        select(-1);
}

const cells = Array.from({ length: 81 }, makeCell);
boardElement.append(...cells);

boardElement.addEventListener('click', onBoardClick);
$('sudoku-pad').addEventListener('click', onPadClick);
$('sudoku-new').addEventListener('click', newGame);
$('sudoku-check').addEventListener('click', check);
document.addEventListener('keydown', onKey);
document.addEventListener('click', onOutsideClick);

setStatus('tap the board to start');
