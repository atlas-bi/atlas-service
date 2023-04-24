import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import lexical, {
  $createRangeSelection,
  $getSelection,
  $setSelection,
  TextNode,
} from 'lexical';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';

import {
  EMOJIREGEX,
  EmojiFinder,
  EmojiLookupService,
  EmojiSearch,
  getTextWidth,
} from '../components/Emoji';

const emojiCache = new Map();

export default function EmojiPlugin() {
  const [editor] = useLexicalComposerContext();
  const [matches, setMatches] = useState();
  const [selectedIndex, setHighlightedIndex] = useState(null);

  const getSearchArea = (selection, text) => {
    const index = selection.focus.offset;

    // get full word
    const textAfter = text.substring(index, text.length);
    let searchArea = text.substring(0, index);

    const trailingText = textAfter.match(/^[^\s].+?(?:\s|$)/g);

    if (trailingText) {
      searchArea += trailingText[0];
    }

    const searchMatch = searchArea.match(EMOJIREGEX);

    let textBefore = '';
    if (searchMatch) {
      textBefore = searchArea.replace(searchMatch, '');
    }

    textBefore = searchMatch
      ? textBefore.replace(':' + searchMatch[2], '')
      : textBefore;

    return {
      textBefore,
      searchMatch,
      searchArea,
      trailingText: trailingText
        ? textAfter.replace(new RegExp(`^${trailingText[0]}`, 'm'), '')
        : textAfter,
    };
  };

  const close = () => {
    setMatches(null);
  };

  const updateSelectedIndex = useCallback(
    (index) => {
      const rootElem = editor.getRootElement();

      if (rootElem !== null) {
        //rootElem.setAttribute('aria-activedescendant', 'typeahead-item-' + index);
        setHighlightedIndex(index);
      }
    },
    [editor],
  );

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(
      TextNode,
      (textNode) => {
        const selection = $getSelection();
        const text = textNode.getTextContent();
        const searchDetails = getSearchArea(selection, text);

        const nodeKey = selection.focus.key;
        const domElement = editor.getElementByKey(nodeKey);
        const rect = domElement
          ? domElement.getBoundingClientRect()
          : undefined;

        if (text && searchDetails.searchMatch && rect) {
          const name = searchDetails.searchMatch[2];
          const styles = getComputedStyle(domElement);
          const width = getTextWidth(searchDetails.textBefore, styles);
          const left = width + rect.left;
          const top = rect.top + rect.height + 7;

          let cachedResults = emojiCache.get(name);
          if (name == null) {
            return setMatches(null);
          }

          if (cachedResults === null) {
            return setMatches(null);
          } else if (cachedResults === undefined) {
            emojiCache.set(name, null);
            cachedResults = EmojiSearch(name);
            emojiCache.set(name, cachedResults);
          }

          const matches = setMatches({
            emojis: cachedResults,
            name,
            left,
            top,
            nodeKey,
            searchDetails,
          });
        } else {
          setMatches(null);
        }
      },
    );
    return removeTransform;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        lexical.KEY_ARROW_DOWN_COMMAND,
        (payload) => {
          const event = payload;

          if (matches !== null && matches.length && selectedIndex !== null) {
            const newSelectedIndex =
              selectedIndex !== matches.length - 1 ? selectedIndex + 1 : 0;
            // updateSelectedIndex(newSelectedIndex);
            const option = matches[newSelectedIndex];

            if (option.ref != null && option.ref.current) {
              editor.dispatchCommand(
                SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND,
                {
                  index: newSelectedIndex,
                  option,
                },
              );
            }

            event.preventDefault();
            event.stopImmediatePropagation();
          }

          return true;
        },
        lexical.COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        lexical.KEY_ARROW_UP_COMMAND,
        (payload) => {
          const event = payload;

          if (matches !== null && matches.length && selectedIndex !== null) {
            const newSelectedIndex =
              selectedIndex !== 0 ? selectedIndex - 1 : matches.length - 1;
            // updateSelectedIndex(newSelectedIndex);
            const option = matches[newSelectedIndex];

            if (option.ref != null && option.ref.current) {
              scrollIntoViewIfNeeded(option.ref.current);
            }

            event.preventDefault();
            event.stopImmediatePropagation();
          }

          return true;
        },
        lexical.COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        lexical.KEY_ESCAPE_COMMAND,
        (payload) => {
          const event = payload;
          console.log('esc');
          event.preventDefault();
          event.stopImmediatePropagation();
          // close();
          return true;
        },
        lexical.COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        lexical.KEY_TAB_COMMAND,
        (payload) => {
          const event = payload;
          console.log('tab');
          if (
            matches === null ||
            selectedIndex === null ||
            matches[selectedIndex] == null
          ) {
            return false;
          }

          event.preventDefault();
          event.stopImmediatePropagation();
          // selectOptionAndCleanUp(matches[selectedIndex]);
          return true;
        },
        lexical.COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        lexical.KEY_ENTER_COMMAND,
        (event) => {
          console.log('enter');
          if (
            matches === null ||
            selectedIndex === null ||
            matches[selectedIndex] == null
          ) {
            return false;
          }

          if (event !== null) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }

          // selectOptionAndCleanUp(matches[selectedIndex]);
          return true;
        },
        lexical.COMMAND_PRIORITY_LOW,
      ),
    );
  }, [
    // selectOptionAndCleanUp,
    close,
    editor,
    matches,
    //  selectedIndex,
    //  updateSelectedIndex
  ]);

  return (
    matches?.emojis.length > 0 && (
      <div
        style={{
          position: 'fixed',
          left: matches.left + 'px',
          top: matches.top + 'px',
          zIndex: '99999999',
        }}
        className="has-border-grey-lighter has-shadow"
      >
        <div className="has-background-white" style={{ minWidth: '200px' }}>
          {matches.emojis.map((x, index, array) => (
            <Fragment key={x[0]}>
              <div
                className={`emoji-select ${
                  index === selectedIndex ? 'is-active' : ''
                }`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  editor.update(() => {
                    const textNode = lexical.$getNodeByKey(matches.nodeKey);
                    const selection = $getSelection();
                    const offset = selection.focus.offset;

                    textNode.setTextContent(
                      matches.searchDetails.textBefore +
                        x[0] +
                        matches.searchDetails.trailingText,
                    );

                    textNode.select(
                      matches.searchDetails.textBefore.length + 1,
                      matches.searchDetails.textBefore.length + 1,
                    );
                  });
                }}
              >
                {x[0]} {x[1]}
              </div>
              {index !== array.length - 1 && <hr className="m-0 p-0" />}
            </Fragment>
          ))}
        </div>
      </div>
    )
  );
}
