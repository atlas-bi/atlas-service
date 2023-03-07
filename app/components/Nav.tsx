import {
  faMagnifyingGlass,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { RequestType } from '@prisma/client';
import { Link, useLoaderData } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import Image from 'remix-image';

import type { loader } from '../root';

export default function Nav() {
  const { navRequestTypes, user } = useLoaderData<typeof loader>();

  const navMenu = useRef<HTMLDivElement>(null);
  const requestDropdownMenu = useRef<HTMLDivElement>(null);
  const profileDropdownMenu = useRef<HTMLDivElement>(null);
  const [isMenuActive, setIsMenuActive] = useState(false);

  const closeDropdowns = () => {
    const dropdowns = document.querySelectorAll(
      '.has-dropdown.is-active:not(.is-hoverable)',
    );
    dropdowns.forEach((el) => {
      el.classList.remove('is-active');
    });
  };

  useEffect(() => {
    window.onclick = (e) => {
      if (!(e.target as HTMLElement)?.closest('.dropdown-button')) {
        closeDropdowns();
      }
    };
    window.addEventListener('keydown', (event) => {
      const e = event || window.event;
      if (e.key === 'Esc' || e.key === 'Escape') {
        closeDropdowns();
      }
    });
  }, []);

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

            <div ref={requestDropdownMenu} className="navbar-item has-dropdown">
              <button
                className="button is-arrowless has-background-white-bis dropdown-button my-auto "
                onClick={(e) => {
                  closeDropdowns();
                  requestDropdownMenu.current?.classList.toggle('is-active');
                }}
              >
                <span className="icon mr-2 has-text-gold">
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                </span>
                New Request
              </button>

              <div className="navbar-dropdown is-boxed">
                {navRequestTypes &&
                  navRequestTypes.map((rt: RequestType) => (
                    <Link
                      key={rt.id}
                      className="navbar-item"
                      to={`/request/new?type=${rt.id}`}
                    >
                      {rt.menuText || rt.name}
                    </Link>
                  ))}
              </div>
            </div>
            <div
              className="navbar-item has-dropdown"
              ref={profileDropdownMenu}
              onClick={(e) => {
                closeDropdowns();
                profileDropdownMenu.current?.classList.toggle('is-active');
              }}
            >
              <div className="navbar-link is-arrowless dropdown-button">
                {user.profilePhoto ? (
                  <figure className="image is-32x32">
                    <img
                      decoding="async"
                      loading="lazy"
                      alt="profile"
                      className="remix-image is-rounded profile"
                      src={`data:image/png;base64,${user.profilePhoto}`}
                    />
                  </figure>
                ) : (
                  'Profile'
                )}
              </div>
              <div className="navbar-dropdown is-boxed is-right">
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
                <hr className="navbar-divider" />
                <a className="navbar-item" href="/admin/config">
                  Site Configuration
                </a>
                <hr className="navbar-divider" />
                <a className="navbar-item" href="/logout">
                  Sign out
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
