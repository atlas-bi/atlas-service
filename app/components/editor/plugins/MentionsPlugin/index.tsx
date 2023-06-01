import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  type QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createTextNode, type TextNode } from 'lexical';
import { type Hit, type Hits } from 'meilisearch';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Separator } from '~/components/ui/separator';

import { $createMentionNode } from '../../nodes/MentionNode';

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

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
const SUGGESTION_LIST_LENGTH_LIMIT = 20;

const mentionsCache = new Map();

const dummyLookupService = {
  search(queryString: string, callback: (results: Hits) => void): void {
    setTimeout(async () => {
      const res = await fetch('/api/search/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/text',
        },
        body: JSON.stringify({
          q: queryString,
          l: SUGGESTION_LIST_LENGTH_LIMIT,
        }),
      });
      const results = await res.json();

      if (results.hits) {
        callback(results.hits);
      } else {
        callback([]);
      }
    }, 500);
  },
};

function useMentionLookupService(queryString: string | null) {
  const [results, setResults] = useState<Hits>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(queryString);

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

    mentionsCache.set(queryString, null);
    dummyLookupService.search(queryString, (newResults) => {
      mentionsCache.set(queryString, newResults);
      setResults(newResults);
    });
  }, [queryString]);

  return results;
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
  return match; // === null ? checkForCapitalizedNameMentions(text, 3) : match;
}

class MentionTypeaheadOption extends TypeaheadOption {
  name: Hit;
  picture: JSX.Element;

  constructor(name: Hit, picture: JSX.Element) {
    super(name);
    this.name = name;
    this.picture = picture;
  }
}

const initials = (user: Hit) =>
  (user.firstName?.slice(0, 1) || 'U') + (user.lastName?.slice(0, 1) || '');

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
        {option.name.profilePhoto && (
          <Avatar className="h-6 w-6 outline outline-blueBase outline-1 outline-offset-1">
            <AvatarImage
              src={`data:image/*;base64,${option.name.profilePhoto}`}
              alt={initials(option.name)}
            />
            <AvatarFallback>{initials(option.name)}</AvatarFallback>
          </Avatar>
        )}
        <div className="media-content my-auto text-slate-700 group-hover:text-slate-900">
          {option.name.firstName} {option.name.lastName}
        </div>
      </div>
      {index !== size - 1 && <Separator />}
    </React.Fragment>
  );
}

export default function MentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const results = useMentionLookupService(queryString);

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
          `/${selectedOption.name.slug}`,
          selectedOption.name.slug,
        );
        const textNode = $createTextNode(
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
        anchorElementRef?.current && results.length
          ? ReactDOM.createPortal(
              <div style={{ marginTop: '25px' }}>
                <div className="bg-white border rounded shadow w-min-[150px] w-max">
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
