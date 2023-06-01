import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  type QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import emoji from 'emojilib';
import { $createTextNode, type TextNode } from 'lexical';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Separator } from '~/components/ui/separator';

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentEmojisRegex = {
  NAME,
  PUNCTUATION,
};

const PUNC = DocumentEmojisRegex.PUNCTUATION;

const TRIGGERS = [':'].join('');

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')';

const LENGTH_LIMIT = 75;

const ColonEmojiRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$',
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const ColonEmojiRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$',
);

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

const emojiCache = new Map();

const emojiLookupService = {
  search(
    name: string,
    callback: (results: Array<string, string>) => void,
  ): void {
    setTimeout(async () => {
      const results = Object.entries(
        Object.keys(emoji).reduce((filtered, k) => {
          if (emoji[k].filter((x) => x.indexOf(name) !== -1).length > 0) {
            filtered[k] = emoji[k][0];
          }

          return filtered;
        }, {}),
      ).slice(0, SUGGESTION_LIST_LENGTH_LIMIT);

      if (results) {
        callback(results);
      } else {
        callback([]);
      }
    }, 500);
  },
};

function useEmojiLookupService(queryString: string | null) {
  const [results, setResults] = useState<Array<string, string>>([]);

  useEffect(() => {
    const cachedResults = emojiCache.get(queryString);

    if (queryString === null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    emojiCache.set(queryString, null);
    emojiLookupService.search(queryString, (newResults) => {
      emojiCache.set(queryString, newResults);
      setResults(newResults);
    });
  }, [queryString]);

  return results;
}

function checkForColonEmoji(
  text: string,
  minMatchLength: number,
): QueryMatch | null {
  let match = ColonEmojiRegex.exec(text);

  if (match === null) {
    match = ColonEmojiRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): QueryMatch | null {
  const match = checkForColonEmoji(text, 1);
  return match; // === null ? checkForCapitalizedNameEmoji(text, 3) : match;
}

class EmojiTypeaheadOption extends TypeaheadOption {
  name: string;
  picture: JSX.Element;

  constructor(name: string, picture: JSX.Element) {
    super(name);
    this.name = name;
    this.picture = picture;
  }
}

function EmojiTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
  size,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmojiTypeaheadOption;
  size: number;
}) {
  let className = 'group cursor-pointer text-sm p-2 my-0 flex space-x-2';
  if (isSelected) {
    className += ' bg-slate-100';
  }

  return (
    <React.Fragment key={option.name.slug}>
      <div
        tabIndex={-1}
        className={className}
        ref={option.setRefElement}
        role="option"
        aria-selected={isSelected}
        id={'typeahead-item-' + index}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        <div className="media-content my-auto space-x-2 text-slate-700 group-hover:text-slate-900">
          <span>{option.name[0]}</span>
          <span>{option.name[1]}</span>
        </div>
      </div>
      {index !== size - 1 && <Separator />}
    </React.Fragment>
  );
}

export default function EmojiPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const results = useEmojiLookupService(queryString);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map((result) => new EmojiTypeaheadOption(result, <i />))
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: EmojiTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const emojiNode = $createTextNode(`${selectedOption.name[0]} `);

        if (nodeToReplace) {
          nodeToReplace.replace(emojiNode);
        }
        closeMenu();
      });
    },
    [editor],
  );

  const checkForEmojiMatch = useCallback(
    (text: string) => {
      const mentionMatch = getPossibleQueryMatch(text);
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      return !slashMatch && mentionMatch ? mentionMatch : null;
    },
    [checkForSlashTriggerMatch, editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<EmojiTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForEmojiMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef && results.length
          ? ReactDOM.createPortal(
              <div style={{ marginTop: '25px' }}>
                <div className="bg-white border rounded shadow w-min-[150px] w-max">
                  {options.map((option, i: number) => (
                    <EmojiTypeaheadMenuItem
                      index={i}
                      size={options.length}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      key={option.name.slug}
                      option={option}
                    />
                  ))}
                </div>
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
}
