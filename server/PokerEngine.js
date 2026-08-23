/**
 * Robust Authoritative Texas Hold'em Poker Engine for Digital Chip Tracking
 */

export const STREETS = {
  PRE_FLOP: 'PRE_FLOP',
  FLOP: 'FLOP',
  TURN: 'TURN',
  RIVER: 'RIVER',
  SHOWDOWN: 'SHOWDOWN',
  HAND_OVER: 'HAND_OVER',
};

export class PokerEngine {
  constructor(config = {}) {
    this.smallBlind = Number(config.smallBlind) || 10;
    this.bigBlind = Number(config.bigBlind) || 20;
    this.ante = Number(config.ante) || 0;
    this.startingStack = Number(config.startingStack) || 1000;
    
    this.players = []; // Array of Player objects
    this.dealerIndex = 0;
    this.currentStreet = STREETS.PRE_FLOP;
    this.handNumber = 0;
    this.isHandActive = false;
    
    // Betting state for the active round
    this.currentTurnIndex = null;
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.lastRaiseAmount = this.bigBlind;
    this.actionOriginIndex = null; // Turn where the last raise/action started
    this.playersActedThisRound = new Set();
    
    // Pots
    this.pots = [{ amount: 0, eligiblePlayers: [] }]; // [{ amount, eligiblePlayers: [playerId, ...] }]
    this.uncalledBet = null; // { playerId, amount }
    
    // Undo stack for current hand
    this.history = [];
    this.actionLog = [];
  }

  // --- SERIALIZATION FOR CLIENT ---
  getState() {
    return {
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      ante: this.ante,
      startingStack: this.startingStack,
      dealerIndex: this.dealerIndex,
      currentStreet: this.currentStreet,
      handNumber: this.handNumber,
      isHandActive: this.isHandActive,
      currentTurnIndex: this.currentTurnIndex,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      pots: this.calculateCurrentPots(),
      totalPot: this.getTotalPot(),
      players: this.players.map((p, idx) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        stack: p.stack,
        roundBet: p.roundBet,
        totalHandBet: p.totalHandBet,
        isFolded: p.isFolded,
        isAllIn: p.isAllIn,
        isSittingOut: p.isSittingOut,
        isConnected: p.isConnected,
        isDealer: idx === this.dealerIndex,
        isSB: idx === this.getSmallBlindIndex(),
        isBB: idx === this.getBigBlindIndex(),
        isTurn: idx === this.currentTurnIndex,
        totalBuyIn: p.totalBuyIn || p.stack,
        loanAmount: p.loanAmount || 0,
        loanRoundsRemaining: p.loanRoundsRemaining || 0,
        seatNumber: idx + 1,
      })),
      actionLog: this.actionLog.slice(-30),
      canUndo: this.history.length > 0,
    };
  }

  // --- PLAYER MANAGEMENT ---
  addPlayer(playerData) {
    const player = {
      id: playerData.id,
      name: playerData.name || `Player ${this.players.length + 1}`,
      avatar: playerData.avatar || '😎',
      stack: playerData.stack !== undefined && Number(playerData.stack) >= 0 ? Number(playerData.stack) : this.startingStack,
      totalBuyIn: playerData.stack !== undefined && Number(playerData.stack) >= 0 ? Number(playerData.stack) : this.startingStack,
      loanAmount: Number(playerData.loanAmount) || 0,
      loanRoundsRemaining: Number(playerData.loanRoundsRemaining) || 0,
      roundBet: 0,
      totalHandBet: 0,
      isFolded: false,
      isAllIn: false,
      isSittingOut: false,
      isConnected: true,
    };
    this.players.push(player);
    this.logAction(`${player.name} joined with $${player.stack}`);
    return player;
  }

  removePlayer(playerId) {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx === -1) return false;
    const player = this.players[idx];
    
    // If hand is active and player hasn't folded, handle hand impact safely
    if (this.isHandActive && !player.isFolded) {
      player.isFolded = true;
      const remainingUnfolded = this.players.filter(p => !p.isFolded && p.id !== playerId);
      
      if (remainingUnfolded.length <= 1) {
        if (remainingUnfolded.length === 1) {
          const winner = remainingUnfolded[0];
          const totalPot = this.getTotalPot();
          winner.stack += totalPot;
          this.logAction(`🏆 ${winner.name} wins $${totalPot} (everyone else folded/left)`);
        }
        this.currentStreet = STREETS.HAND_OVER;
        this.isHandActive = false;
        this.currentTurnIndex = null;
      } else if (this.currentTurnIndex === idx) {
        this.advanceTurn();
      }
    }
    
    // Adjust turn index if player before current turn was removed
    if (this.currentTurnIndex !== null && this.currentTurnIndex > idx) {
      this.currentTurnIndex--;
    }
    
    this.players.splice(idx, 1);
    this.logAction(`${player.name} was removed from the table`);
    
    // Adjust dealer & turn indices if out of bounds
    if (this.players.length === 0) {
      this.dealerIndex = 0;
      this.currentTurnIndex = null;
      this.isHandActive = false;
    } else {
      if (this.dealerIndex >= this.players.length) {
        this.dealerIndex = 0;
      }
      if (this.currentTurnIndex !== null && this.currentTurnIndex >= this.players.length) {
        this.currentTurnIndex = 0;
      }
    }
    return true;
  }

  reorderPlayers(orderedPlayerIds) {
    if (this.isHandActive) {
      throw new Error('Cannot reorder players while a hand is in progress');
    }
    const map = new Map(this.players.map(p => [p.id, p]));
    const newPlayers = [];
    for (const id of orderedPlayerIds) {
      if (map.has(id)) {
        newPlayers.push(map.get(id));
      }
    }
    for (const p of this.players) {
      if (!newPlayers.includes(p)) {
        newPlayers.push(p);
      }
    }
    this.players = newPlayers;
    this.dealerIndex = 0;
    this.logAction('Host updated player seating arrangement');
  }

  getPlayerIndex(playerId) {
    if (!playerId) return -1;
    const str = String(playerId).trim().toLowerCase();
    return this.players.findIndex(p => p.id === playerId || (p.name && p.name.trim().toLowerCase() === str));
  }

  rebuy(playerId, amount) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) return false;
    const player = this.players[playerIdx];
    player.stack += Number(amount);
    player.totalBuyIn = (player.totalBuyIn || 0) + Number(amount);
    if (player.stack > 0 && player.isAllIn && !this.isHandActive) {
      player.isAllIn = false;
    }
    this.logAction(`${player.name} rebought +$${amount} (Stack: $${player.stack})`);
    return true;
  }

  editStack(playerId, newStack) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) return false;
    const player = this.players[playerIdx];
    const diff = Number(newStack) - player.stack;
    player.stack = Number(newStack);
    player.totalBuyIn = (player.totalBuyIn || 0) + diff;
    this.logAction(`Host updated ${player.name}'s stack to $${player.stack}`);
    return true;
  }

  takeLoan(playerId, customAmount = null) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) throw new Error('Player not found');
    const player = this.players[playerIdx];

    const loanAmt = Number(customAmount) > 0 ? Number(customAmount) : this.startingStack;
    player.stack += loanAmt;
    player.totalBuyIn = (player.totalBuyIn || 0) + loanAmt;
    player.loanAmount = (player.loanAmount || 0) + loanAmt;
    player.isSittingOut = true;
    player.loanRoundsRemaining = 1; // Sit out the very next hand
    if (player.isAllIn && !this.isHandActive) {
      player.isAllIn = false;
    }
    this.logAction(`💳 ${player.name} took a loan of $${loanAmt} (Sitting out next hand)`);
    return { success: true, player };
  }

  repayLoan(playerId, amount = null) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) throw new Error('Player not found');
    const player = this.players[playerIdx];
    if (!player.loanAmount || player.loanAmount <= 0) {
      throw new Error('No active loan to repay');
    }

    const maxRepay = Math.min(player.loanAmount, player.stack);
    const repayAmt = amount ? Math.min(Number(amount), maxRepay) : maxRepay;
    if (repayAmt <= 0) throw new Error('Cannot repay $0');

    player.stack -= repayAmt;
    player.loanAmount -= repayAmt;
    this.logAction(`💰 ${player.name} repaid $${repayAmt} of their loan (Remaining Debt: $${player.loanAmount})`);
    return { success: true, player };
  }

  // --- POSITION HELPERS ---
  getActivePlayersInHand() {
    return this.players.filter(p => !p.isSittingOut && p.stack + p.roundBet > 0);
  }

  getEligiblePlayersForHand() {
    return this.players.filter(p => !p.isSittingOut && p.stack > 0);
  }

  getSmallBlindIndex() {
    const eligible = this.getEligiblePlayersForHand();
    if (eligible.length < 2) return null;
    if (eligible.length === 2) {
      return this.dealerIndex; // Heads up: dealer is SB
    }
    return this.getNextActiveIndex(this.dealerIndex);
  }

  getBigBlindIndex() {
    const eligible = this.getEligiblePlayersForHand();
    if (eligible.length < 2) return null;
    if (eligible.length === 2) {
      return this.getNextActiveIndex(this.dealerIndex); // Heads up: other player is BB
    }
    const sb = this.getSmallBlindIndex();
    return this.getNextActiveIndex(sb);
  }

  getNextActiveIndex(fromIndex) {
    if (this.players.length === 0) return null;
    let curr = (fromIndex + 1) % this.players.length;
    let attempts = 0;
    while (attempts < this.players.length) {
      const p = this.players[curr];
      if (!p.isSittingOut && p.stack + p.roundBet > 0 && !p.isFolded) {
        return curr;
      }
      curr = (curr + 1) % this.players.length;
      attempts++;
    }
    return null;
  }

  getNextTurnIndex(fromIndex) {
    if (this.players.length === 0) return null;
    let curr = (fromIndex + 1) % this.players.length;
    let attempts = 0;
    while (attempts < this.players.length) {
      const p = this.players[curr];
      if (!p.isSittingOut && !p.isFolded && !p.isAllIn) {
        return curr;
      }
      curr = (curr + 1) % this.players.length;
      attempts++;
    }
    return null;
  }

  // --- HAND LIFECYCLE ---
  startHand() {
    const eligible = this.getEligiblePlayersForHand();
    if (eligible.length < 2) {
      throw new Error('At least 2 players with chips are required to start a hand');
    }

    this.saveStateSnapshot();
    this.handNumber += 1;
    this.isHandActive = true;
    this.currentStreet = STREETS.PRE_FLOP;
    this.history = []; // reset undo for fresh hand
    
    // Advance dealer button if not first hand
    if (this.handNumber > 1) {
      this.dealerIndex = this.getNextActiveIndex(this.dealerIndex);
    }

    // Reset player round/hand state
    for (const p of this.players) {
      p.roundBet = 0;
      p.totalHandBet = 0;
      p.isFolded = p.isSittingOut || p.stack <= 0;
      p.isAllIn = false;
    }

    this.actionLog = [];
    this.logAction(`--- Hand #${this.handNumber} Started ---`);

    // Post Antes if configured
    if (this.ante > 0) {
      for (const p of this.players) {
        if (!p.isFolded) {
          const anteAmount = Math.min(p.stack, this.ante);
          p.stack -= anteAmount;
          p.roundBet += anteAmount;
          p.totalHandBet += anteAmount;
          if (p.stack === 0) p.isAllIn = true;
        }
      }
      this.logAction(`Antes of $${this.ante} posted`);
    }

    // Post Blinds
    const sbIdx = this.getSmallBlindIndex();
    const bbIdx = this.getBigBlindIndex();

    const sbPlayer = this.players[sbIdx];
    const sbAmount = Math.min(sbPlayer.stack, this.smallBlind);
    sbPlayer.stack -= sbAmount;
    sbPlayer.roundBet += sbAmount;
    sbPlayer.totalHandBet += sbAmount;
    if (sbPlayer.stack === 0) sbPlayer.isAllIn = true;
    this.logAction(`${sbPlayer.name} posts Small Blind $${sbAmount}`);

    const bbPlayer = this.players[bbIdx];
    const bbAmount = Math.min(bbPlayer.stack, this.bigBlind);
    bbPlayer.stack -= bbAmount;
    bbPlayer.roundBet += bbAmount;
    bbPlayer.totalHandBet += bbAmount;
    if (bbPlayer.stack === 0) bbPlayer.isAllIn = true;
    this.logAction(`${bbPlayer.name} posts Big Blind $${bbAmount}`);

    this.currentBet = Math.max(sbAmount, bbAmount);
    this.minRaise = this.bigBlind;
    this.lastRaiseAmount = this.bigBlind;
    this.playersActedThisRound = new Set();

    // First to act pre-flop:
    // In Heads Up (2 players), SB (Dealer) acts first pre-flop
    // In 3+ players, UTG (player after BB) acts first
    if (this.players.filter(p => !p.isFolded).length === 2) {
      this.currentTurnIndex = sbIdx;
    } else {
      this.currentTurnIndex = this.getNextTurnIndex(bbIdx);
    }

    this.actionOriginIndex = this.currentTurnIndex;

    // Check if auto-advance needed (e.g. players were already all-in from blinds)
    this.checkAutoAdvance();
  }

  // --- ACTIONS ---
  fold(playerId) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) throw new Error('Player not found');
    const player = this.players[playerIdx];

    if (this.currentTurnIndex !== playerIdx && this.isHandActive) {
      throw new Error('Not your turn to act');
    }

    this.saveStateSnapshot();
    player.isFolded = true;
    this.logAction(`${player.name} Folds`);

    const remaining = this.players.filter(p => !p.isFolded && !p.isSittingOut);
    if (remaining.length === 1) {
      const winner = remaining[0];
      const totalPot = this.getTotalPot();
      winner.stack += totalPot;
      this.logAction(`🏆 ${winner.name} wins $${totalPot} (everyone else folded)`);
      this.finishHand();
      return;
    }

    this.advanceTurn();
  }

  check(playerId) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) throw new Error('Player not found');
    const player = this.players[playerIdx];

    if (this.currentTurnIndex !== playerIdx) {
      throw new Error('Not your turn to act');
    }

    if (player.roundBet < this.currentBet) {
      throw new Error(`Cannot check: Must call $${this.currentBet - player.roundBet}`);
    }

    this.saveStateSnapshot();
    this.playersActedThisRound.add(playerIdx);
    this.logAction(`${player.name} Checks`);
    this.advanceTurn();
  }

  call(playerId) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) throw new Error('Player not found');
    const player = this.players[playerIdx];

    if (this.currentTurnIndex !== playerIdx) {
      throw new Error('Not your turn to act');
    }

    const needed = this.currentBet - player.roundBet;
    if (needed <= 0) {
      return this.check(playerId);
    }

    this.saveStateSnapshot();
    const callAmount = Math.min(player.stack, needed);
    player.stack -= callAmount;
    player.roundBet += callAmount;
    player.totalHandBet += callAmount;

    if (player.stack === 0) {
      player.isAllIn = true;
      this.logAction(`${player.name} Calls $${callAmount} (ALL-IN!)`);
    } else {
      this.logAction(`${player.name} Calls $${callAmount}`);
    }

    this.playersActedThisRound.add(playerIdx);
    this.advanceTurn();
  }

  raise(playerId, targetBetAmount) {
    const playerIdx = this.getPlayerIndex(playerId);
    if (playerIdx === -1) throw new Error('Player not found');
    const player = this.players[playerIdx];

    if (this.currentTurnIndex !== playerIdx) {
      throw new Error('Not your turn to act');
    }

    targetBetAmount = Number(targetBetAmount);
    const needed = targetBetAmount - player.roundBet;
    if (needed > player.stack) {
      targetBetAmount = player.roundBet + player.stack; // clamp to max all-in
    }

    const isAllIn = targetBetAmount >= player.roundBet + player.stack;
    const raiseDiff = targetBetAmount - this.currentBet;

    // Minimum raise validation unless all-in
    if (!isAllIn && raiseDiff < this.minRaise && this.currentBet > 0) {
      throw new Error(`Minimum raise is to $${this.currentBet + this.minRaise}`);
    }

    this.saveStateSnapshot();
    const additionalBet = targetBetAmount - player.roundBet;
    player.stack -= additionalBet;
    player.roundBet = targetBetAmount;
    player.totalHandBet += additionalBet;

    if (raiseDiff > 0) {
      this.minRaise = raiseDiff;
      this.lastRaiseAmount = raiseDiff;
      this.currentBet = targetBetAmount;
      this.actionOriginIndex = playerIdx; // New betting origin
      this.playersActedThisRound.clear(); // Everyone must act again to match this raise
    }

    if (player.stack === 0) {
      player.isAllIn = true;
      this.logAction(`${player.name} Raises to $${targetBetAmount} (ALL-IN!)`);
    } else {
      if (this.currentBet === targetBetAmount && raiseDiff === targetBetAmount) {
        this.logAction(`${player.name} Bets $${targetBetAmount}`);
      } else {
        this.logAction(`${player.name} Raises to $${targetBetAmount}`);
      }
    }

    this.playersActedThisRound.add(playerIdx);
    this.advanceTurn();
  }

  // --- TURN & STREET PROGRESSION ---
  advanceTurn() {
    const activeUnfolded = this.players.filter(p => !p.isFolded);
    if (activeUnfolded.length <= 1) {
      return; // Hand already concluded in fold()
    }

    // Check if betting round is complete
    const playersAbleToAct = this.players.filter(p => !p.isFolded && !p.isAllIn);
    
    // If no players can act, advance street
    if (playersAbleToAct.length <= 1) {
      const allMatched = this.players
        .filter(p => !p.isFolded && !p.isAllIn)
        .every(p => p.roundBet === this.currentBet);
        
      if (allMatched || playersAbleToAct.length === 0) {
        return this.advanceStreet();
      }
    }

    // Find next player to act
    let nextIdx = this.getNextTurnIndex(this.currentTurnIndex);
    
    // A round is complete if:
    // 1. Every active (non-allin) player has acted AT LEAST once since the last raise/origin
    // 2. All active non-allin players have matched the currentBet
    const allActiveMatched = this.players
      .filter(p => !p.isFolded && !p.isAllIn)
      .every(p => p.roundBet === this.currentBet && this.playersActedThisRound.has(this.players.indexOf(p)));

    if (allActiveMatched) {
      return this.advanceStreet();
    }

    this.currentTurnIndex = nextIdx;
    this.checkAutoAdvance();
  }

  advanceStreet() {
    // Reset round bets into total pot
    for (const p of this.players) {
      p.roundBet = 0;
    }
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.playersActedThisRound.clear();

    const activeInHand = this.players.filter(p => !p.isFolded);
    const activeNonAllIn = activeInHand.filter(p => !p.isAllIn);

    // If 0 or 1 player has chips remaining to bet, fast forward to SHOWDOWN
    if (activeNonAllIn.length <= 1) {
      this.currentStreet = STREETS.SHOWDOWN;
      this.currentTurnIndex = null;
      this.logAction(`Fast-forwarding to Showdown (all-in action complete)`);
      return;
    }

    // Transition street
    switch (this.currentStreet) {
      case STREETS.PRE_FLOP:
        this.currentStreet = STREETS.FLOP;
        this.logAction(`--- Flop ---`);
        break;
      case STREETS.FLOP:
        this.currentStreet = STREETS.TURN;
        this.logAction(`--- Turn ---`);
        break;
      case STREETS.TURN:
        this.currentStreet = STREETS.RIVER;
        this.logAction(`--- River ---`);
        break;
      case STREETS.RIVER:
        this.currentStreet = STREETS.SHOWDOWN;
        this.currentTurnIndex = null;
        this.logAction(`--- Showdown ---`);
        return;
      default:
        this.currentStreet = STREETS.SHOWDOWN;
        this.currentTurnIndex = null;
        return;
    }

    // Post-flop, first active player clockwise from dealer button acts first
    this.currentTurnIndex = this.getNextTurnIndex(this.dealerIndex);
    this.actionOriginIndex = this.currentTurnIndex;
    this.checkAutoAdvance();
  }

  checkAutoAdvance() {
    const activeInHand = this.players.filter(p => !p.isFolded);
    const activeNonAllIn = activeInHand.filter(p => !p.isAllIn);

    if (activeInHand.length <= 1) return;

    if (activeNonAllIn.length === 0) {
      // All remaining players are all-in
      this.currentStreet = STREETS.SHOWDOWN;
      this.currentTurnIndex = null;
    }
  }

  // --- POTS & SIDE POT CALCULATION ---
  getTotalPot() {
    return this.players.reduce((sum, p) => sum + p.totalHandBet, 0);
  }

  calculateCurrentPots() {
    const contributions = this.players
      .filter(p => p.totalHandBet > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        total: p.totalHandBet,
        isFolded: p.isFolded,
        isAllIn: p.isAllIn,
      }));

    if (contributions.length === 0) {
      return [{ name: 'Main Pot', amount: 0, eligiblePlayerIds: [] }];
    }

    // Find all distinct all-in levels + max bet
    const allInLevels = [
      ...new Set(
        contributions
          .filter(c => c.isAllIn && !c.isFolded)
          .map(c => c.total)
      )
    ].sort((a, b) => a - b);

    const pots = [];
    let previousLevel = 0;

    for (let i = 0; i < allInLevels.length; i++) {
      const level = allInLevels[i];
      const tierContribution = level - previousLevel;
      if (tierContribution <= 0) continue;

      let potAmount = 0;
      const eligible = [];

      for (const c of contributions) {
        if (c.total > previousLevel) {
          const added = Math.min(c.total - previousLevel, tierContribution);
          potAmount += added;
          if (!c.isFolded && c.total >= level) {
            eligible.push(c.id);
          }
        }
      }

      if (potAmount > 0) {
        pots.push({
          name: i === 0 ? 'Main Pot' : `Side Pot ${i}`,
          amount: potAmount,
          eligiblePlayerIds: eligible,
        });
      }
      previousLevel = level;
    }

    // Remaining chips above highest all-in level (or if no all-in, the entire main pot)
    let remainderAmount = 0;
    const remainderEligible = [];

    for (const c of contributions) {
      if (c.total > previousLevel) {
        const added = c.total - previousLevel;
        remainderAmount += added;
        if (!c.isFolded) {
          remainderEligible.push(c.id);
        }
      }
    }

    if (remainderAmount > 0) {
      pots.push({
        name: pots.length === 0 ? 'Main Pot' : `Side Pot ${pots.length}`,
        amount: remainderAmount,
        eligiblePlayerIds: remainderEligible,
      });
    }

    return pots.length > 0 ? pots : [{ name: 'Main Pot', amount: 0, eligiblePlayerIds: [] }];
  }

  // --- SHOWDOWN WINNER DISTRIBUTION ---
  awardPots(potWinners) {
    // potWinners: [{ potIndex: 0, winnerIds: ['id1', 'id2'] }]
    this.saveStateSnapshot();
    const currentPots = this.calculateCurrentPots();

    for (const pw of potWinners) {
      const pot = currentPots[pw.potIndex];
      if (!pot || pw.winnerIds.length === 0) continue;

      const splitShare = Math.floor(pot.amount / pw.winnerIds.length);
      let remainder = pot.amount % pw.winnerIds.length;

      for (let i = 0; i < pw.winnerIds.length; i++) {
        const winnerId = pw.winnerIds[i];
        const winner = this.players.find(p => p.id === winnerId);
        if (winner) {
          const extraChip = remainder > 0 ? 1 : 0;
          if (extraChip > 0) remainder--;
          const totalWon = splitShare + extraChip;
          winner.stack += totalWon;
          this.logAction(`🏆 ${winner.name} won $${totalWon} from ${pot.name}`);
        }
      }
    }

    this.finishHand();
  }

  finishHand() {
    this.currentStreet = STREETS.HAND_OVER;
    this.isHandActive = false;
    this.currentTurnIndex = null;

    // 1. Process sit-out loan countdown for any players who took a loan
    for (const p of this.players) {
      if (p.loanRoundsRemaining > 0) {
        p.loanRoundsRemaining -= 1;
        if (p.loanRoundsRemaining <= 0) {
          p.isSittingOut = false;
          p.loanRoundsRemaining = 0;
          this.logAction(`✅ ${p.name}'s sit-out complete. Returning to table next hand!`);
        }
      }
    }

    // 2. Process automatic loan repayment if player reached double initial stack (stack >= 2 * startingStack)
    for (const p of this.players) {
      if (p.loanAmount > 0 && p.stack >= this.startingStack * 2) {
        const repayAmt = Math.min(p.loanAmount, p.stack - this.startingStack);
        if (repayAmt > 0) {
          p.stack -= repayAmt;
          p.loanAmount -= repayAmt;
          this.logAction(`💰 ${p.name} doubled their initial stack and repaid $${repayAmt} loan! (Remaining Debt: $${p.loanAmount})`);
        }
      }
    }
  }

  // --- UNDO MECHANISM ---
  saveStateSnapshot() {
    const snapshot = {
      players: JSON.parse(JSON.stringify(this.players)),
      dealerIndex: this.dealerIndex,
      currentStreet: this.currentStreet,
      handNumber: this.handNumber,
      isHandActive: this.isHandActive,
      currentTurnIndex: this.currentTurnIndex,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      lastRaiseAmount: this.lastRaiseAmount,
      actionOriginIndex: this.actionOriginIndex,
      playersActedThisRound: Array.from(this.playersActedThisRound),
      actionLog: [...this.actionLog],
    };
    this.history.push(snapshot);
    if (this.history.length > 20) this.history.shift(); // keep last 20 snapshots
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.players = prev.players;
    this.dealerIndex = prev.dealerIndex;
    this.currentStreet = prev.currentStreet;
    this.handNumber = prev.handNumber;
    this.isHandActive = prev.isHandActive;
    this.currentTurnIndex = prev.currentTurnIndex;
    this.currentBet = prev.currentBet;
    this.minRaise = prev.minRaise;
    this.lastRaiseAmount = prev.lastRaiseAmount;
    this.actionOriginIndex = prev.actionOriginIndex;
    this.playersActedThisRound = new Set(prev.playersActedThisRound);
    this.actionLog = prev.actionLog;
    this.logAction(`⏪ Host undid the last action`);
    return true;
  }

  logAction(msg) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.actionLog.push(`[${timestamp}] ${msg}`);
  }
}
