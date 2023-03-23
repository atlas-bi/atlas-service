import Image from 'remix-image';

export const ProfilePhoto = ({ base64 }: { base64?: string }) => {
  if (base64) {
    return (
      <img
        decoding="async"
        loading="lazy"
        alt="profile"
        className="remix-image is-rounded profile"
        src={`data:image/png;base64,${base64}`}
      />
    );
  }

  return (
    <Image
      loaderUrl="/api/image"
      src="/images/user.png"
      responsive={[
        {
          size: {
            width: 48,
            height: 48,
          },
          maxWidth: 48,
        },
      ]}
      //dprVariants={[1, 3]}
    />
  );
};
