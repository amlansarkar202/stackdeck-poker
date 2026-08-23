/**
 * Cash Game Settlement Calculator
 * Computes the optimal (minimum) number of transactions to balance all player buy-ins and cash-outs.
 */

export function calculateSettlement(players) {
  // players: [{ id, name, buyIn, cashOut }]
  const balances = players.map(p => {
    const buyIn = Number(p.buyIn) || 0;
    const cashOut = Number(p.cashOut) || 0;
    return {
      id: p.id,
      name: p.name || 'Anonymous',
      buyIn,
      cashOut,
      net: cashOut - buyIn, // Positive = Creditor (is owed money), Negative = Debtor (owes money)
    };
  });

  const totalBuyIn = balances.reduce((sum, p) => sum + p.buyIn, 0);
  const totalCashOut = balances.reduce((sum, p) => sum + p.cashOut, 0);
  const diff = totalCashOut - totalBuyIn;
  const isBalanced = Math.abs(diff) < 0.01;

  // Separate debtors and creditors
  const debtors = balances
    .filter(p => p.net < -0.01)
    .map(p => ({ ...p, remaining: Math.abs(p.net) }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = balances
    .filter(p => p.net > 0.01)
    .map(p => ({ ...p, remaining: p.net }))
    .sort((a, b) => b.remaining - a.remaining);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.remaining, creditor.remaining);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      transactions.push({
        from: debtor.name,
        fromId: debtor.id,
        to: creditor.name,
        toId: creditor.id,
        amount: roundedAmount,
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining < 0.01) dIdx++;
    if (creditor.remaining < 0.01) cIdx++;
  }

  return {
    balances,
    totalBuyIn,
    totalCashOut,
    diff,
    isBalanced,
    transactions,
  };
}

export function generateSettlementText(settlementResult) {
  const { totalBuyIn, totalCashOut, balances, transactions, isBalanced, diff } = settlementResult;
  
  let text = `♠️♥️ POKER SESSION SETTLEMENT SUMMARY ♣️♦️\n\n`;
  text += `📊 TOTALS:\n`;
  text += `• Total Buy-in:  $${totalBuyIn}\n`;
  text += `• Total Cash-out: $${totalCashOut}\n`;
  if (!isBalanced) {
    text += `⚠️ Discrepancy: $${diff > 0 ? '+' : ''}${diff} (Check table counts)\n`;
  }
  text += `\n👤 PLAYER RESULTS:\n`;

  balances.forEach(p => {
    const sign = p.net > 0 ? '+' : p.net < 0 ? '-' : '';
    const netFormatted = `${sign}$${Math.abs(p.net)}`;
    text += `• ${p.name}: Buy-in $${p.buyIn} ➡️ Cash-out $${p.cashOut} (${netFormatted})\n`;
  });

  text += `\n💸 RECOMMENDED TRANSFERS (Minimum Transactions):\n`;
  if (transactions.length === 0) {
    text += `• Everyone is even! No transfers needed.\n`;
  } else {
    transactions.forEach(t => {
      text += `👉 ${t.from} pays ${t.to}: $${t.amount}\n`;
    });
  }

  text += `\nGenerated with PokerChip App 🎲`;
  return text;
}
