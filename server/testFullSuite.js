import assert from 'assert';
import { PokerEngine, STREETS } from './PokerEngine.js';
import { GameManager } from './GameManager.js';

console.log('🧪 Starting Comprehensive Full-Suite Test for StackDeck...\n');

// ==========================================
// TEST 1: FULL 5-STREET GAMEPLAY & POT MATH
// ==========================================
console.log('--- Test 1: Full 5-Street Hand Simulation (Pre-Flop to Showdown) ---');
const engine = new PokerEngine({ smallBlind: 10, bigBlind: 20, startingStack: 1000 });
engine.addPlayer({ id: 'p1', name: 'Alice', stack: 1000 });
engine.addPlayer({ id: 'p2', name: 'Bob', stack: 1000 });
engine.addPlayer({ id: 'p3', name: 'Charlie', stack: 1000 });

engine.startHand();
assert(engine.isHandActive === true, 'Hand is active');
assert(engine.currentStreet === STREETS.PRE_FLOP, 'Street is PRE_FLOP');
assert(engine.players[1].roundBet === 10, 'Bob posted SB of 10');
assert(engine.players[2].roundBet === 20, 'Charlie posted BB of 20');
assert(engine.currentTurnIndex === 0, 'Alice is UTG and acts first pre-flop');

// Pre-flop: Alice calls 20, Bob calls 20, Charlie checks 20
engine.call('p1');
assert(engine.players[0].roundBet === 20, 'Alice called 20');
engine.call('p2');
assert(engine.players[1].roundBet === 20, 'Bob called 20');
engine.check('p3');
assert(engine.currentStreet === STREETS.FLOP, 'Advances to FLOP');
assert(engine.getTotalPot() === 60, 'Pot is $60 on Flop');

// Flop: Bob checks, Charlie bets 50, Alice calls 50, Bob calls 50
engine.check('p2');
engine.raise('p3', 50);
engine.call('p1');
engine.call('p2');
assert(engine.currentStreet === STREETS.TURN, 'Advances to TURN');
assert(engine.getTotalPot() === 210, 'Pot is $210 on Turn ($60 + $150)');

// Turn: Bob checks, Charlie checks, Alice checks
engine.check('p2');
engine.check('p3');
engine.check('p1');
assert(engine.currentStreet === STREETS.RIVER, 'Advances to RIVER');

// River: Bob checks, Charlie bets 100, Alice folds, Bob calls 100
engine.check('p2');
engine.raise('p3', 100);
engine.fold('p1');
assert(engine.players[0].isFolded === true, 'Alice folded');
engine.call('p2');
assert(engine.currentStreet === STREETS.SHOWDOWN, 'Advances to SHOWDOWN');
assert(engine.getTotalPot() === 410, 'Final pot is $410');

// Showdown: Charlie wins the main pot
engine.awardPots([{ potIndex: 0, winnerIds: ['p3'] }]);
assert(engine.isHandActive === false, 'Hand concluded');
assert(engine.players[2].stack === 1000 - 20 - 50 - 100 + 410, 'Charlie stack correctly updated with pot winnings');
console.log('✅ PASSED: 5-street lifecycle & pot progression');


// ==========================================
// TEST 2: ALL-FOLD WALKOVER WIN
// ==========================================
console.log('\n--- Test 2: Walkover Win (All Opponents Fold) ---');
const walkEngine = new PokerEngine({ smallBlind: 10, bigBlind: 20, startingStack: 1000 });
walkEngine.addPlayer({ id: 'w1', name: 'Player 1', stack: 1000 });
walkEngine.addPlayer({ id: 'w2', name: 'Player 2', stack: 1000 });
walkEngine.addPlayer({ id: 'w3', name: 'Player 3', stack: 1000 });

walkEngine.startHand();
walkEngine.fold('w1');
walkEngine.fold('w2');
assert(walkEngine.isHandActive === false, 'Hand concluded automatically');
assert(walkEngine.currentStreet === STREETS.HAND_OVER, 'Street is HAND_OVER');
assert(walkEngine.players[2].stack === 1000 + 10, 'Last remaining player automatically won the blinds');
console.log('✅ PASSED: Immediate walkover win on opponent folds');


// ==========================================
// TEST 3: MULTI-TIER SIDE POTS WITH 3 ALL-INS
// ==========================================
console.log('\n--- Test 3: Multi-Level Side Pots ---');
const sideEngine = new PokerEngine({ smallBlind: 10, bigBlind: 20 });
sideEngine.addPlayer({ id: 's1', name: 'Short', stack: 100 });
sideEngine.addPlayer({ id: 's2', name: 'Mid', stack: 300 });
sideEngine.addPlayer({ id: 's3', name: 'Deep', stack: 1000 });

sideEngine.startHand();
sideEngine.raise('s1', 100);
sideEngine.raise('s2', 300);
sideEngine.call('s3');

const sidePots = sideEngine.calculateCurrentPots();
assert(sidePots.length === 2, '2 pots generated: Main Pot and Side Pot 1');
assert(sidePots[0].amount === 300, 'Main Pot is $300 ($100 x 3)');
assert(sidePots[0].eligiblePlayerIds.length === 3, 'All 3 eligible for Main Pot');
assert(sidePots[1].amount === 400, 'Side Pot 1 is $400 (($300 - $100) x 2)');
assert(sidePots[1].eligiblePlayerIds.length === 2, 'Only Mid and Deep eligible for Side Pot 1');
console.log('✅ PASSED: Multi-tier side pots division');


// ==========================================
// TEST 4: LOAN STACK, SIT-OUT & AUTO REPAYMENT
// ==========================================
console.log('\n--- Test 4: Loan Stack, Sit-Out Penalty & Auto Repayment ---');
const loanEngine = new PokerEngine({ smallBlind: 10, bigBlind: 20, startingStack: 1000 });
loanEngine.addPlayer({ id: 'l1', name: 'Leader', stack: 1000 });
loanEngine.addPlayer({ id: 'l2', name: 'Challenger', stack: 1000 });
loanEngine.addPlayer({ id: 'l3', name: 'Broke', stack: 0 });

// Player takes loan stack
loanEngine.takeLoan('l3', 1000);
assert(loanEngine.players[2].stack === 1000, 'Loan granted $1000');
assert(loanEngine.players[2].loanAmount === 1000, 'Debt recorded $1000');
assert(loanEngine.players[2].isSittingOut === true, 'Player sitting out next round');

// Hand 1 starts (Broke player sits out)
loanEngine.startHand();
assert(loanEngine.players[2].roundBet === 0, 'Sitting out player skipped for blinds');
loanEngine.fold('l1'); // hand finishes

assert(loanEngine.players[2].isSittingOut === false, 'Sit-out ends after 1 hand');
assert(loanEngine.players[2].loanRoundsRemaining === 0, 'Penalty cleared');

// Player doubles up
loanEngine.players[2].stack = 2200;
loanEngine.finishHand();
assert(loanEngine.players[2].loanAmount === 0, 'Loan automatically repaid upon reaching 2x stack');
assert(loanEngine.players[2].stack === 1200, 'Stack reduced by repaid debt ($2200 - $1000 = $1200)');
console.log('✅ PASSED: Loan stack, sit-out penalty, and double repayment');


// ==========================================
// TEST 5: KICK PLAYER DURING ACTIVE HAND
// ==========================================
console.log('\n--- Test 5: Kick Player During Active Hand ---');
const kickEngine = new PokerEngine({ smallBlind: 10, bigBlind: 20, startingStack: 1000 });
kickEngine.addPlayer({ id: 'k1', name: 'Player 1', stack: 1000 });
kickEngine.addPlayer({ id: 'k2', name: 'Player 2', stack: 1000 });
kickEngine.addPlayer({ id: 'k3', name: 'Player 3', stack: 1000 });

kickEngine.startHand();
// Kick Player 2 while hand is active
kickEngine.removePlayer('k2');
assert(kickEngine.players.length === 2, 'Player 2 removed from table');
assert(kickEngine.players.find(p => p.id === 'k2') === undefined, 'Player 2 no longer in roster');
console.log('✅ PASSED: Robust player removal during active hand');


// ==========================================
// TEST 6: GAME MANAGER ROOM LIFECYCLE & CLEANUP
// ==========================================
console.log('\n--- Test 6: Room Manager & Disconnect Handling ---');
const gm = new GameManager(null);
const room = gm.createRoom({ id: 'host1', name: 'Host' }, { startingStack: 1000 });
const roomId = room.id;
assert(room.id && room.id.length === 4, 'Room created with 4-letter code');

const { activePlayer } = gm.joinRoom(roomId, { id: 'guest1', name: 'Guest' }, 'sock1');
assert(activePlayer.name === 'Guest', 'Guest player joined room');

// Disconnect handling
gm.handleDisconnect('sock1');
assert(room.engine.players[1].isConnected === false, 'Guest marked disconnected');

// Reconnection with same ID
const reconnectResult = gm.joinRoom(roomId, { id: 'guest1', name: 'Guest' }, 'sock2');
assert(reconnectResult.activePlayer.isConnected === true, 'Guest seat reconnected seamlessly');
console.log('✅ PASSED: Room creation, seamless reconnection, and disconnect handling');

console.log('\n🎉 ALL 6 COMPREHENSIVE SUITE TESTS PASSED WITH ZERO ERRORS!\n');
