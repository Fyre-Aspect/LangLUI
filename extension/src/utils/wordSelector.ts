export const COMMON_TRANSLATIONS: Record<string, Record<string, string>> = {
  'time':     { ja:'時間', es:'tiempo',  fr:'temps',    de:'Zeit',      ko:'시간',   hi:'समय',    pt:'tempo',   it:'tempo',   zh:'时间', ar:'وقت'  },
  'people':   { ja:'人々', es:'gente',   fr:'gens',     de:'Menschen',  ko:'사람들', hi:'लोग',    pt:'pessoas', it:'persone', zh:'人们', ar:'ناس'  },
  'world':    { ja:'世界', es:'mundo',   fr:'monde',    de:'Welt',      ko:'세계',   hi:'दुनिया', pt:'mundo',   it:'mondo',   zh:'世界', ar:'عالم' },
};

export interface WordMap {
  words:      string[];
  nodeMap:    Map<string, Text[]>;
  contextFor: Record<string, string>;
}

export function getSentenceContext(node: Text, word: string): string {
  const text = node.nodeValue ?? '';
  const idx  = text.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - 75);
  const end   = Math.min(text.length, idx + word.length + 75);
  return text.slice(start, end).trim();
}

export const selectWords = (intensity: number, root: HTMLElement | Document = document): WordMap => {
  const walk = document.createTreeWalker(root instanceof Document ? root.body : root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toUpperCase();
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'CANVAS'].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip already-replaced spans
      if (parent.classList?.contains('langlua-word') || parent.classList?.contains('langlua-practice')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodeMap    = new Map<string, Text[]>();
  const wordsSet   = new Set<string>();
  const stopwords  = new Set(['the','and','for','with','that','this','have','from','they']);

  let globalWordCounter = 0;
  // Intensity 10 -> every 3rd word (33%), Intensity 1 -> every 50th (2%)
  const n = Math.max(3, Math.floor(55 - intensity * 5.2));

  let node;
  while ((node = walk.nextNode())) {
    const textNode = node as Text;
    const text     = textNode.nodeValue || '';
    const tokens   = text.split(/[^a-zÀ-ÿ']+/i);

    for (const word of tokens) {
      if (word.length < 2) continue;
      const lower = word.toLowerCase().trim();
      if (stopwords.has(lower)) continue;

      globalWordCounter++;
      if (globalWordCounter % n === 0) {
        wordsSet.add(lower);
        const nodes = nodeMap.get(lower) ?? [];
        nodes.push(textNode);
        nodeMap.set(lower, nodes);
      }
    }
  }

  const words = Array.from(wordsSet);
  const contextFor: Record<string, string> = {};
  for (const word of words) {
    const firstNode = nodeMap.get(word)?.[0];
    if (firstNode) contextFor[word] = getSentenceContext(firstNode, word);
  }

  return { words, nodeMap, contextFor };
};
