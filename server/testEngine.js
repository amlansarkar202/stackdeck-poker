import { PokerEngine, STREETS } from './PokerEngine.js';

console.log('🧪 Starting Poker Engine Unit Tests...\n');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// --- TEST 1: Basic Game Initialization & Blinds ---
console.log('\n--- Test 1: Blinds Posting & Position ---');
const engine = new PokerEngine({ smallBlind: 10, bigBlind: 20, startingStack: 1000 });
engine.addPlayer({ id: 'p1', name: 'Alice', stack: 1000 });
engine.addPlayer({ id: 'p2', name: 'Bob', stack: 1000 });
engine.addPlayer({ id: 'p3', name: 'Charlie', stack: 1000 });

engine.startHand();

const state = engine.getState();
assert(state.isHandActive === true, 'Hand is active');
assert(state.currentStreet === STREETS.PRE_FLOP, 'Current street is PRE_FLOP');
assert(state.players.find(p => p.id === 'p2').roundBet === 10, 'Bob posted SB of $10');
assert(state.players.find(p => p.id === 'p3').roundBet === 20, 'Charlie posted BB of $20');
assert(state.currentTurnIndex === 0, 'Alice is UTG and acts first pre-flop');

// --- TEST 2: Betting Round & Street Advance ---
console.log('\n--- Test 2: Call, Check, and Street Transition ---');
// Alice calls $20
engine.call('p1');
assert(engine.players[0].roundBet === 20, 'Alice called $20');
// Bob calls difference ($10 more to reach $20)
engine.call('p2');
assert(engine.players[1].roundBet === 20, 'Bob called to $20');
// Charlie checks BB
engine.check('p3');
assert(engine.currentStreet === STREETS.FLOP, 'Street advanced to FLOP');
assert(engine.getTotalPot() === 60, 'Total pot is $60 ($20 x 3)');

// --- TEST 3: Side Pots & All-In Calculations ---
console.log('\n--- Test 3: Side Pots Calculation ---');
const sideEngine = new PokerEngine({ smallBlind: 10, bigBlind: 20 });
sideEngine.addPlayer({ id: 'a', name: 'Short Stack', stack: 100 });
sideEngine.addPlayer({ id: 'b', name: 'Mid Stack', stack: 300 });
sideEngine.addPlayer({ id: 'c', name: 'Big Stack', stack: 1000 });

sideEngine.startHand();
// a is on button (dealer=0), b is SB (idx=1, $10), c is BB (idx=2, $20)
// Short Stack (a) goes all-in for $100
sideEngine.raise('a', 100);
// Mid Stack (b) goes all-in for $300
sideEngine.raise('b', 300);
// Big Stack (c) calls $300
sideEngine.call('c');

const pots = sideEngine.calculateCurrentPots();
console.log('Calculated Pots:', JSON.stringify(pots, null, 2));

assert(pots.length === 2, 'Two pots created: Main Pot and Side Pot');
assert(pots[0].name === 'Main Pot', 'First pot is Main Pot');
assert(pots[0].amount === 300, 'Main pot is $300 ($100 x 3)');
assert(pots[0].eligiblePlayerIds.length === 3, 'All 3 players eligible for Main Pot');

assert(pots[1].name === 'Side Pot 1', 'Second pot is Side Pot 1');
assert(pots[1].amount === 400, 'Side pot is $400 (($300 - $100) x 2)');
assert(pots[1].eligiblePlayerIds.length === 2, 'Only Mid and Big stack eligible for Side Pot 1');

// --- TEST 4: Undo Action ---
console.log('\n--- Test 4: Undo Functionality ---');
const undoEngine = new PokerEngine({ smallBlind: 10, bigBlind: 20 });
undoEngine.addPlayer({ id: 'u1', name: 'Player 1', stack: 500 });
undoEngine.addPlayer({ id: 'u2', name: 'Player 2', stack: 500 });

undoEngine.startHand();
const stackBeforeRaise = undoEngine.players[0].stack;
undoEngine.raise('u1', 100);
assert(undoEngine.players[0].roundBet === 100, 'Player 1 raised to $100');

undoEngine.undo();
assert(undoEngine.players[0].stack === stackBeforeRaise, 'Stack restored after undo');
assert(undoEngine.players[0].roundBet === 10, 'Round bet restored to SB after undo');

// --- TEST 5: Loan Stack, Sit-Out, & Double Repayment ---
console.log('\n--- Test 5: Loan Stack, Sit-Out, & Double Repayment ---');
const loanEngine = new PokerEngine({ smallBlind: 10, bigBlind: 20, startingStack: 1000 });
loanEngine.addPlayer({ id: 'p1', name: 'Player 1', stack: 1000 });
loanEngine.addPlayer({ id: 'p2', name: 'Player 2', stack: 1000 });
loanEngine.addPlayer({ id: 'p3', name: 'Player 3', stack: 0 }); // Player 3 busted

// Player 3 takes loan stack
loanEngine.takeLoan('p3', 1000);
assert(loanEngine.players[2].stack === 1000, 'Player 3 received $1000 loan stack');
assert(loanEngine.players[2].loanAmount === 1000, 'Player 3 has $1000 loan debt');
assert(loanEngine.players[2].isSittingOut === true, 'Player 3 is sitting out next hand');
assert(loanEngine.players[2].loanRoundsRemaining === 1, 'Player 3 has 1 round sit-out remaining');

// Start hand with active players (p1 & p2)
loanEngine.startHand();
assert(loanEngine.players[2].roundBet === 0, 'Sitting out player did not post blinds');

// Hand finishes
loanEngine.fold('p1');
assert(loanEngine.players[2].isSittingOut === false, 'Player 3 sit-out completed after 1 hand');
assert(loanEngine.players[2].loanRoundsRemaining === 0, 'Sit-out rounds remaining reset to 0');

// Test Double repayment: Give Player 3 $2100 (>= 2 * startingStack)
loanEngine.players[2].stack = 2100;
loanEngine.finishHand();
assert(loanEngine.players[2].loanAmount === 0, 'Player 3 loan of $1000 was automatically repaid');
assert(loanEngine.players[2].stack === 1100, 'Player 3 stack was reduced by loan amount ($2100 - $1000 = $1100)');

console.log('\n🎉 ALL POKER ENGINE TESTS PASSED SUCCESSFULLY!\n');
