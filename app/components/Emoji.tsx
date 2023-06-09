import emoji from 'emojilib';
import { Fragment, useEffect, useState } from 'react';

export const EMOJIREGEX = new RegExp(/(^|\s):([^\s]+?)$/m);
const emojiCache = new Map();

export const EmojiSearch = (name) => {
  const matches = Object.entries(
    Object.keys(emoji).reduce((filtered, k) => {
      if (emoji[k].filter((x) => x.indexOf(name) !== -1).length > 0) {
        filtered[k] = emoji[k][0];
      }

      return filtered;
    }, {}),
  ).slice(0, 5);

  return matches;
};

export const EmojiLookupService = (name: string) => {
  const [results, setResults] = useState<Array<string>>([]);

  useEffect(() => {
    const cachedResults = emojiCache.get(name);

    if (name == null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    emojiCache.set(name, null);
    const matches = EmojiSearch(name);
    emojiCache.set(name, matches);
    setResults[matches];
  }, [name]);

  return results;
};

export const getTextWidth = (text, styles) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = styles.getPropertyValue('font');
  const metrics = context.measureText(text);
  return metrics.width;
};

export const EmojiFinder = ({ input, value, setter }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setInputValue(value);
    if (value) {
      setShowPopup(true);
    }
  }, [value]);

  useEffect(() => {
    if (input) {
      input.onfocus = () => {
        setShowPopup(true);
      };
      input.onfocusout = () => {
        setShowPopup(false);
      };
    }
  }, [input]);

  if (inputValue.length > 0 && EMOJIREGEX.test(inputValue)) {
    const name = inputValue.match(EMOJIREGEX)[2];

    const matches = EmojiSearch(name);

    if (matches.length > 0) {
      const begin = inputValue.replace(name, '');

      const styles = getComputedStyle(input);
      const width = getTextWidth(begin, styles);

      const left =
        width +
        Number(styles.getPropertyValue('padding-left').replace('px', '')) +
        Number(styles.getPropertyValue('margin-left').replace('px', ''));

      return (
        <>
          {showPopup && (
            <div className="is-relative" style={{ zIndex: 99999999 }}>
              <div
                className="is-absolute"
                style={{ top: '7px', left: left + 'px' }}
              >
                <div
                  style={{ position: 'fixed' }}
                  className="has-border-grey-lighter has-shadow"
                >
                  <div
                    className="has-background-white"
                    style={{ minWidth: '200px' }}
                  >
                    {matches.map((x, index, array) => (
                      <Fragment key={x[0]}>
                        <div
                          className="emoji-select"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setter(inputValue.replace(':' + name, x[0]));
                            // input.focus()
                          }}
                        >
                          {x[0]} {x[1]}
                        </div>
                        {index !== array.length - 1 && (
                          <hr className="m-0 p-0" />
                        )}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
  }
  return <></>;
};
