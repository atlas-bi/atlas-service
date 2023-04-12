import { $createLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {
  $createNodeSelection,
  $createTextNode,
  $getSelection,
  $setSelection,
  DELETE_CHARACTER_COMMENT,
  DecoratorNode,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from 'lexical';
import { MeiliSearch } from 'meilisearch';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { $createMentionNode, $isMentionNode } from '../nodes/MentionNode';
import { $createTextTokenNode } from '../nodes/TextTokenNode';

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const CapitalizedNameMentionsRegex = new RegExp(
  '(^|[^#])((?:' + DocumentMentionsRegex.NAME + '{' + 1 + ',})$)',
);

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ['@'].join('');

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

const AtSignMentionsRegex = new RegExp(
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
const AtSignMentionsRegexAliasRegex = new RegExp(
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

const mentionsCache = new Map();

const dummyLookupService = {
  search(
    queryString: string,
    MEILISEARCH_URL: string,
    MEILISEARCH_KEY: string,
    searchIndex: string,
    callback: (results: Array<string>) => void,
  ): void {
    const client = new MeiliSearch({
      host: MEILISEARCH_URL,
      apiKey: MEILISEARCH_KEY,
    });
    setTimeout(async () => {
      const results = await client
        .index(searchIndex)
        .search(queryString, { limit: 20 });

      if (results.hits) {
        callback(results.hits);
      } else {
        callback([]);
      }
    }, 500);
  },
};

function useMentionLookupService(
  queryString: string | null,
  MEILISEARCH_URL: string,
  MEILISEARCH_KEY: string,
  searchIndex: string,
) {
  const [results, setResults] = useState<Array<string>>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(queryString);

    if (queryString == null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionsCache.set(queryString, null);
    dummyLookupService.search(
      queryString,
      MEILISEARCH_URL,
      MEILISEARCH_KEY,
      searchIndex,
      (newResults) => {
        mentionsCache.set(queryString, newResults);
        setResults(newResults);
      },
    );
  }, [queryString]);

  return results;
}

function checkForCapitalizedNameMentions(
  text: string,
  minMatchLength: number,
): QueryMatch | null {
  const match = CapitalizedNameMentionsRegex.exec(text);
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[2];
    if (matchingString != null && matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: matchingString,
      };
    }
  }
  return null;
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number,
): QueryMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
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
  const match = checkForAtSignMentions(text, 1);
  return match === null ? checkForCapitalizedNameMentions(text, 3) : match;
}

class MentionTypeaheadOption extends TypeaheadOption {
  name: string;
  picture: JSX.Element;

  constructor(name: string, picture: JSX.Element) {
    super(name);
    this.name = name;
    this.picture = picture;
  }
}

function MentionsTypeaheadMenuItem({
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
  option: MentionTypeaheadOption;
  size: number;
}) {
  let className = 'emoji-select media py-2 my-0 px-2';
  if (isSelected) {
    className += ' is-active';
  }

  return (
    <React.Fragment key={option.key.id}>
      <article
        tabIndex={-1}
        className={className}
        ref={option.setRefElement}
        role="option"
        aria-selected={isSelected}
        id={'typeahead-item-' + index}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        {option.name.profilePhoto && (
          <div className="media-left my-auto">
            <figure className="image is-20x20">
              <img
                decoding="async"
                loading="lazy"
                alt="profile"
                className="remix-image is-rounded profile"
                src={`data:image/png;base64,${option.name.profilePhoto}`}
              />
            </figure>
          </div>
        )}
        <div className="media-content my-auto">
          {option.name.firstName} {option.name.lastName}
        </div>
      </article>
      {index !== size - 1 && <hr className="m-0 p-0" />}
    </React.Fragment>
  );
}

export default function MentionsPlugin({
  MEILISEARCH_URL,
  MEILISEARCH_KEY,
  searchIndex,
}: {
  MEILISEARCH_URL: string;
  MEILISEARCH_KEY: string;
  searchIndex: string;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const results = useMentionLookupService(
    queryString,
    MEILISEARCH_URL,
    MEILISEARCH_KEY,
    searchIndex,
  );

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map((result) => new MentionTypeaheadOption(result, <i />))
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(
          `/users/${selectedOption.name.id}`,
          selectedOption.name.id,
        );
        const textNode = $createTextTokenNode(
          `@${selectedOption.name.firstName} ${selectedOption.name.lastName}`,
        );

        const spaceNode = $createTextNode(' ');
        mentionNode.append(textNode);

        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.insertAfter(spaceNode);
        spaceNode.select();
        console.log('closing');
        closeMenu();
      });
    },
    [editor],
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const mentionMatch = getPossibleQueryMatch(text);
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      return !slashMatch && mentionMatch ? mentionMatch : null;
    },
    [checkForSlashTriggerMatch, editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef && results.length
          ? ReactDOM.createPortal(
              <div style={{ marginTop: '25px' }}>
                <div
                  className="has-background-white has-border-grey-lighter has-shadow"
                  style={{ minWidth: '200px' }}
                >
                  {options.map((option, i: number) => (
                    <MentionsTypeaheadMenuItem
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
                      key={option.key.id}
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
