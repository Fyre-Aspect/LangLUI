export const selectWords = (intensity: number): { words: string[], wordNodes: Map<string, Text[]> } => {
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const stopwords = new Set(["the", "and", "for", "with", "that", "this", "have", "will", "from", "they", "what", "when", "where", "which", "there", "their", "been", "would", "could", "should", "about", "other", "into", "your", "more", "also", "some", "than", "then", "only", "very", "just", "like", "over", "such", "these", "those", "here", "each", "much", "after", "before", "while", "being"]);

  const wordNodes = new Map<string, Text[]>();
  const wordsSet = new Set<string>();

  let node;
  while ((node = walk.nextNode())) {
    const textNode = node as Text;
    const text = textNode.nodeValue || '';
    const words = text.split(/[\s\p{P}]+/u);

    words.forEach(word => {
      const lower = word.toLowerCase();
      if (/^[a-zA-Z]{4,15}$/.test(word) && !stopwords.has(lower)) {
        let prob = 0.05;
        if (intensity >= 4 && intensity <= 6) prob = 0.15;
        if (intensity >= 7) prob = 0.30;

        if (Math.random() < prob) {
          wordsSet.add(lower);
          const nodes = wordNodes.get(lower) || [];
          nodes.push(textNode);
          wordNodes.set(lower, nodes);
        }
      }
    });
  }

  return { words: Array.from(wordsSet), wordNodes };
};
