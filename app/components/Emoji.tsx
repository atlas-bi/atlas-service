import emoji from 'emojilib';
import { Fragment, useEffect, useState } from 'react';

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

export const Input = ({ input, value, setter }) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (inputValue.length > 0 && /:[^\s]+?$/.test(inputValue)) {
    const name = inputValue.match(/(?!:)[^\s]+?$/)[0];

    const matches = EmojiSearch(name);

    if (matches.length > 0) {
      const begin = inputValue.replace(name, '');

      const styles = getComputedStyle(input);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = styles.getPropertyValue('font');
      const metrics = context.measureText(begin);

      const left =
        metrics.width +
        Number(styles.getPropertyValue('padding-left').replace('px', '')) +
        Number(styles.getPropertyValue('margin-left').replace('px', ''));

      return (
        <>
          <div className="is-relative">
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
                  {matches.map((x) => (
                    <Fragment key={x[0]}>
                      <div
                        className="emoji-select"
                        onClick={() => {
                          console.log('clicked!');
                          console.log(
                            inputValue.replace(':' + name, x[0]),
                            name,
                            x[0],
                          );
                          setter(inputValue.replace(':' + name, x[0]));
                        }}
                      >
                        {x[0]} {x[1]}
                      </div>
                      <hr className="m-0 p-0" />
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  }
  return <></>;
};
