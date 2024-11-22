const Footer = () => {
  return (
    <footer className="bg-gray-100 p-4 text-center text-sm">
      <div>
        <p>
          Made by{" "}
          <a
            href="https://simson.io/"
            target="_blank"
            className="font-semibold"
          >
            Jan Simson
          </a>
          .
        </p>
        <p className="text-gray-600 mt-1">
          Inspired by{" "}
          <a
            className="font-semibold"
            target="_blank"
            href="https://emilhvitfeldt.github.io/r-color-palettes/"
            rel="nofollow"
          >
            r-color-palettes
          </a>{" "}
          and{" "}
          <a
            className="font-semibold"
            target="_blank"
            href="https://emilhvitfeldt.github.io/paletteer/"
            rel="nofollow"
          >
            paletteer
          </a>{" "}
          by Emil Hvitfeldt.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
