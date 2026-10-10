// Masked player handle for the Cook & Create game screen.
//
// The impostor game only works if a player's handle gives nothing away about
// who they really are, so the alias is derived purely from the participant id
// and NEVER from the name they typed at registration. It's deterministic, so
// every viewer sees the same handle for a given player and it stays stable
// across all three rounds.
//
// The words are deliberately not ingredient names — a handle like "Fox42"
// can't be confused with an ingredient card on the board.
const ALIAS_WORDS = [
    'Fox', 'Owl', 'Otter', 'Panda', 'Koala', 'Robin',
    'Heron', 'Lynx', 'Wolf', 'Hawk', 'Bear', 'Deer',
    'Swan', 'Crane', 'Finch', 'Seal', 'Wren', 'Ibis',
    'Puffin', 'Falcon', 'Sparrow', 'Magpie', 'Raven', 'Badger',
];

// `name` is intentionally ignored — it's kept in the signature so existing
// callers don't change, and so the real name is never a source for the handle.
export function shortName(_name: string, id: number): string {
    const word = ALIAS_WORDS[id % ALIAS_WORDS.length];
    return `${word}${(id % 70) + 30}`;
}
