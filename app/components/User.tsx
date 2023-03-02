import { Link } from '@remix-run/react';

export const MiniUser = ({ user, linkToUser, onClick, children }) => {
  const name = (
    <strong>
      {user.firstName || user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email}
    </strong>
  );
  return (
    <article
      className="media has-background-white py-2 my-0 px-2 is-clickable"
      onClick={onClick}
    >
      {user.profilePhoto && (
        <div className="media-left">
          <figure className="image is-20x20">
            <img
              decoding="async"
              loading="lazy"
              alt="profile"
              className="remix-image is-rounded profile"
              src={`data:image/png;base64,${user.profilePhoto}`}
            />
          </figure>
        </div>
      )}
      <div className="media-content my-auto">
        {linkToUser ? <Link to="/">{name}</Link> : name}
        {children}
      </div>
    </article>
  );
};
