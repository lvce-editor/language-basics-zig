/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideDoubleQuoteString: 2,
  InsideSingleQuoteString: 3,
  AfterPropertyDot: 4,
}

/**
 * @enum number
 */
export const TokenType = {
  None: 1,
  Whitespace: 2,
  Punctuation: 3,
  String: 4,
  Keyword: 5,
  KeywordControl: 6,
  KeywordReturn: 7,
  KeywordImport: 8,
  Numeric: 9,
  VariableName: 10,
  FunctionName: 11,
  Type: 12,
  LanguageConstant: 13,
  Comment: 14,
  Text: 15,
  KeywordVoid: 16,
}

export const TokenMap = {
  [TokenType.None]: 'None',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.String]: 'String',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.KeywordControl]: 'KeywordControl',
  [TokenType.KeywordReturn]: 'KeywordReturn',
  [TokenType.KeywordImport]: 'KeywordImport',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.FunctionName]: 'Function',
  [TokenType.Type]: 'Type',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.Comment]: 'Comment',
  [TokenType.Text]: 'Text',
  [TokenType.KeywordVoid]: 'KeywordVoid',
}

const RE_WHITESPACE = /^\s+/
const RE_LINE_COMMENT = /^\/\/.*/
const RE_MULTILINE_STRING = /^\\\\.*/
const RE_STRING_IDENTIFIER = /^@"(?:\\.|[^"\\])*"/
const RE_IMPORT_BUILTIN = /^@import\b/
const RE_BUILTIN = /^@[A-Za-z_][A-Za-z0-9_]*/
const RE_DOUBLE_QUOTE = /^"/
const RE_SINGLE_QUOTE = /^'/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"\\]+/
const RE_STRING_SINGLE_QUOTE_CONTENT = /^[^'\\]+/
const RE_STRING_ESCAPE = /^\\(?:x[0-9A-Fa-f]{0,2}|u\{[0-9A-Fa-f]*\}|.)/
const RE_BACKSLASH = /^\\/
const RE_KEYWORD =
  /^(?:addrspace|align|allowzero|and|anyframe|anytype|asm|break|callconv|catch|comptime|const|continue|defer|else|enum|errdefer|error|export|extern|fn|for|if|inline|linksection|noalias|noinline|nosuspend|opaque|or|orelse|packed|pub|resume|return|struct|suspend|switch|test|threadlocal|try|union|unreachable|var|void|volatile|while)\b/
const RE_LANGUAGE_CONSTANT = /^(?:false|null|true|undefined)\b/
const RE_PRIMITIVE_TYPE =
  /^(?:anyerror|anyopaque|bool|c_char|c_int|c_long|c_longdouble|c_longlong|c_short|c_uint|c_ulong|c_ulonglong|c_ushort|comptime_float|comptime_int|f(?:16|32|64|80|128)|i\d+|isize|noreturn|type|u\d+|usize)\b/
const RE_NUMBER =
  /^(?:0[xX][0-9A-Fa-f](?:_?[0-9A-Fa-f])*\.?[0-9A-Fa-f_]*(?:[pP][+-]?[0-9](?:_?[0-9])*)?|0[bB][01](?:_?[01])*|0[oO][0-7](?:_?[0-7])*|[0-9](?:_?[0-9])*(?:\.[0-9](?:_?[0-9])*)?(?:[eE][+-]?[0-9](?:_?[0-9])*)?)/
const RE_FUNCTION_NAME = /^[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/
const RE_TYPE_NAME = /^[A-Z][A-Za-z0-9_]*/
const RE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*/
const RE_PUNCTUATION = /^[()[\]{}.,;:?~!%^&*+\-=|<>/]+/
const RE_ANY_CHARACTER = /^./u

export const initialLineState = {
  state: State.TopLevelContent,
}

export const hasArrayReturn = true

/**
 * @param {any} lineStateA
 * @param {any} lineStateB
 */
export const isEqualLineState = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

/**
 * @param {string} line
 * @param {any} lineState
 */
export const tokenizeLine = (line, lineState) => {
  let index = 0
  let state = lineState.state
  const tokens = []
  while (index < line.length) {
    const part = line.slice(index)
    let next
    let token
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
        } else if ((next = part.match(RE_MULTILINE_STRING))) {
          token = TokenType.String
        } else if ((next = part.match(RE_STRING_IDENTIFIER))) {
          token = TokenType.VariableName
        } else if ((next = part.match(RE_IMPORT_BUILTIN))) {
          token = TokenType.KeywordImport
        } else if ((next = part.match(RE_BUILTIN))) {
          token = TokenType.FunctionName
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_SINGLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_LANGUAGE_CONSTANT))) {
          token = TokenType.LanguageConstant
        } else if ((next = part.match(RE_KEYWORD))) {
          token = getKeywordToken(next[0])
        } else if ((next = part.match(RE_PRIMITIVE_TYPE))) {
          token = TokenType.Type
        } else if ((next = part.match(RE_NUMBER))) {
          token = TokenType.Numeric
        } else if ((next = part.match(RE_FUNCTION_NAME))) {
          token = TokenType.FunctionName
        } else if ((next = part.match(RE_TYPE_NAME))) {
          token = TokenType.Type
        } else if ((next = part.match(RE_IDENTIFIER))) {
          token = TokenType.VariableName
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
          if (next[0] === '.') {
            state = State.AfterPropertyDot
          }
        } else if ((next = part.match(RE_ANY_CHARACTER))) {
          token = TokenType.Text
        } else {
          throw new Error('Failed to tokenize Zig source')
        }
        break
      case State.AfterPropertyDot:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
        } else if ((next = part.match(RE_FUNCTION_NAME))) {
          token = TokenType.FunctionName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_IDENTIFIER))) {
          token = TokenType.VariableName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANY_CHARACTER))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          throw new Error('Failed to tokenize Zig property access')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
        } else if ((next = part.match(RE_BACKSLASH))) {
          token = TokenType.String
        } else {
          throw new Error('Failed to tokenize Zig string')
        }
        break
      case State.InsideSingleQuoteString:
        if ((next = part.match(RE_SINGLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_SINGLE_QUOTE_CONTENT))) {
          token = TokenType.String
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
        } else if ((next = part.match(RE_BACKSLASH))) {
          token = TokenType.String
        } else {
          throw new Error('Failed to tokenize Zig character literal')
        }
        break
      default:
        throw new Error('Invalid Zig tokenizer state')
    }
    index += next[0].length
    tokens.push(token, next[0].length)
  }
  return {
    state: State.TopLevelContent,
    tokens,
  }
}

/**
 * @param {string} keyword
 */
const getKeywordToken = (keyword) => {
  switch (keyword) {
    case 'break':
    case 'catch':
    case 'continue':
    case 'else':
    case 'for':
    case 'if':
    case 'orelse':
    case 'switch':
    case 'try':
    case 'while':
      return TokenType.KeywordControl
    case 'return':
      return TokenType.KeywordReturn
    case 'extern':
      return TokenType.KeywordImport
    case 'void':
      return TokenType.KeywordVoid
    default:
      return TokenType.Keyword
  }
}
