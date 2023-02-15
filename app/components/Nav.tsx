import Image from 'remix-image';

export default function Nav() {
    return (
        <div className="navbar has-shadow is-sticky is-align-items-center is-transparent">
            <div className="container">
                <div className="navbar-brand">
                    <a className="navbar-item" href="/">
                        <Image
                            loaderUrl="/api/image"
                            src="atlas-logo.png"
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
                    </a>
                    <div
                        className="navbar-burger"
                        onClick={(event) => {
                            const span = event?.target as HTMLSpanElement;
                            span.classList.toggle('is-active');
                            document
                                .getElementById('main-nav')
                                ?.classList.toggle('is-active');
                        }}
                    />
                </div>
                <div className="navbar-container  is-flex is-flex-grow-1 is-align-items-center px-3 py-3">
                    <form
                        id="search-form"
                        className="is-flex is-flex-grow-1 is-align-items-center mx-3 is-relative"
                    >
                        <div id="search-background"></div>
                        <div className="control has-icons-left is-flex-grow-1">
                            <span className="icon is-small is-left has-text-grey-lighter">
                                <i className="fas fa-magnifying-glass"></i>
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

                <div className="is-flex-grow-0 navbar-menu">
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

                        <a className="navbar-item" href="/requests/new">
                            New Request
                        </a>
                        <a className="navbar-item" href="/admin/config">
                            Site Configuration
                        </a>
                        <div className="navbar-item is-hoverable is-boxed">
                            <div className="navbar-link is-arrowless">
                                Stuff
                            </div>
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
                            <div className="navbar-link is-arrowless">
                                Profile
                            </div>
                            <div className="navbar-dropdown">
                                <a className="navbar-item" href="/users">
                                    Your profile
                                </a>
                                <a className="navbar-item" href="/users#stars">
                                    Your stars
                                </a>
                                <hr className="navbar-divider" />
                                <a
                                    className="navbar-item"
                                    href="/users/settings"
                                >
                                    Settings
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
