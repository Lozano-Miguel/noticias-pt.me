function similarity(a, b) {
  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .split(/\s+/)
      .filter(Boolean);

  const wordsA = new Set(normalize(a));
  const wordsB = new Set(normalize(b));

  const intersection = [...wordsA].filter((word) => wordsB.has(word));
  const union = new Set([...wordsA, ...wordsB]);

  if (union.size === 0) return 0;
  return intersection.length / union.size;
}

function deduplicateArticles(articles) {
  const threshold = 0.5;
  const usedIds = new Set();
  const result = [];

  for (const article of articles) {
    if (usedIds.has(article.id)) continue;

    const current = { ...article, also_in: [] };
    usedIds.add(article.id);

    for (const other of articles) {
      if (other.id === article.id || usedIds.has(other.id)) continue;

      if (similarity(article.title || "", other.title || "") > threshold) {
        usedIds.add(other.id);
        current.also_in.push(other.source);
      }
    }

    result.push(current);
  }

  return result;
}

export default deduplicateArticles;
