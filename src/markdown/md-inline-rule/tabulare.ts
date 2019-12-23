import { parseInlineTabular, TTokenTabular } from "../md-block-rule/begin-tabular";
import { ParseTabular } from "../md-block-rule/begin-tabular/parse-tabular";

export const inlineTabular = (state, silent) => {
  let startMathPos = state.pos;
  if (state.src.charCodeAt(startMathPos) !== 0x5c /* \ */) {
    return false;
  }
  const match = state.src
    .slice(++startMathPos)
    .match(/^(?:|begin\s{0,}{tabular})/);
  if (!match) {
    return false;
  }
  startMathPos += match[0].length;
  const endMarker= '\\end{tabular}';
  const endMarkerPos = state.src.indexOf(endMarker, startMathPos);
  if (endMarkerPos === -1) {
    return false;
  }
  const nextPos = endMarkerPos + endMarker.length;
  if (!silent) {
    const token = state.push("tabulare", "", 0);
    token.content = state.src.slice(startMathPos-1, endMarkerPos + '\\end{tabular}'.length);
    token.children =[];
    const cTabular =  parseInlineTabular(token.content);
    if (!cTabular) {
      return false
    }
    for (let i = 0; i < cTabular.length; i++) {
      if (cTabular[i].type === 'inline'){continue}
      const res: Array<TTokenTabular> | null = ParseTabular(cTabular[i].content, 0, cTabular[i].align);
      for (let i = 0; i < res.length;  i++) {
        const tok = res[i];
        if (tok.token === 'inline') {
          let children = [];
          state.md.inline.parse(tok.content, state.md, state.env, children);
          tok.children = children;
        }
        token.children.push(tok);
      }
    }
  }

  state.pos = nextPos;
  return true;
};
