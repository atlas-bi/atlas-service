import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState } from 'react';
import Image from 'remix-image';

export default function Nav() {
  const navMenu = useRef<HTMLDivElement>(null);
  const [isMenuActive, setIsMenuActive] = useState(false);
  return (
    <div className="navbar has-shadow is-align-items-center is-transparent is-fixed-top">
      <div className="container">
        <div className="navbar-brand is-flex-grow-1">
          <a className="navbar-item" href="/">
            <Image
              loaderUrl="/api/image"
              className="is-hidden-mobile"
              src="/images/atlas/atlas-logo.png"
              responsive={[
                {
                  size: {
                    width: 133,
                    height: 40,
                  },
                  maxWidth: 133,
                },
              ]}
              // dprVariants={[1, 3]}
            />
            <Image
              loaderUrl="/api/image"
              className="is-hidden-tablet"
              src="/images/atlas/thinking-face.png"
              responsive={[
                {
                  size: {
                    width: 40,
                    height: 40,
                  },
                  maxWidth: 40,
                },
              ]}
              // dprVariants={[1, 3]}
            />
          </a>
          <div className="navbar-item is-flex-grow-1 is-flex-shrink-1">
            <form
              id="search-form"
              className="is-flex is-flex-grow-1 is-align-items-center mx-3 is-relative"
            >
              <div id="search-background"></div>
              <div className="control has-icons-left is-flex-grow-1">
                <span className="icon is-small is-left has-text-grey-lighter">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                  className="input"
                  type="text"
                  placeholder=""
                  maxLength={80}
                  required
                />
              </div>
            </form>
          </div>
          <div
            className={`navbar-burger ${isMenuActive ? 'is-active' : ''}`}
            onClick={() => {
              setIsMenuActive((current) => !current);
            }}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </div>
        </div>

        <div
          className={`is-flex-grow-0 navbar-menu ${
            isMenuActive ? 'is-active' : ''
          }`}
          ref={navMenu}
        >
          <div className="navbar-start">
            <div className="navbar-item" aria-label="mail">
              <span className="icon is-medium is-relative">
                <i className="far fa-lg fa-envelope"></i>
                <span
                  title="mail count"
                  className="badge"
                  id="nav_unread_message_count"
                >
                  0
                </span>
              </span>
              <span className="hide-desktop">Mail</span>
            </div>

            <a className="navbar-item" href="/request/new">
              New Request
            </a>
            <a className="navbar-item" href="/admin/config">
              Site Configuration
            </a>
            <div className="navbar-item is-hoverable is-boxed">
              <div className="navbar-link is-arrowless">Stuff</div>
              <div className="navbar-dropdown">
                <hr className="navbar-divider hide-desktop" />
                <a className="navbar-item" href="/initiatives">
                  Initiatives
                </a>
                <a className="navbar-item" href="/collections">
                  Collections
                </a>
                <a className="navbar-item" href="/terms">
                  Terms
                </a>
              </div>
            </div>

            <div className="navbar-item is-hoverable is-boxed">
              <div className="navbar-link is-arrowless">Profile</div>
              <div className="navbar-dropdown">
                <a className="navbar-item" href="/users">
                  Your profile
                </a>
                <a className="navbar-item" href="/users#stars">
                  Your stars
                </a>
                <hr className="navbar-divider" />
                <a className="navbar-item" href="/users/settings">
                  Settings
                </a>
              </div>
            </div>
          </div>
          <div className="navbar-end"></div>
        </div>
      </div>
    </div>
  );
}
