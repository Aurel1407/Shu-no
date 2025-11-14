const SkipLinks = () => {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed top-0 left-0 bg-bleu-profond text-white px-4 py-2 z-50 font-semibold"
        onClick={(e) => {
          e.preventDefault();
          const mainContent = document.getElementById("main-content");
          mainContent?.focus();
          mainContent?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Aller au contenu principal
      </a>

      <a
        href="#main-nav"
        className="sr-only focus:not-sr-only fixed top-8 left-0 bg-bleu-profond text-white px-4 py-2 z-50 font-semibold"
        onClick={(e) => {
          e.preventDefault();
          const nav = document.getElementById("main-nav");
          nav?.focus();
          nav?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Aller à la navigation principale
      </a>

      <a
        href="#main-footer"
        className="sr-only focus:not-sr-only fixed top-16 left-0 bg-bleu-profond text-white px-4 py-2 z-50 font-semibold"
        onClick={(e) => {
          e.preventDefault();
          const footer = document.getElementById("main-footer");
          footer?.focus();
          footer?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Aller au pied de page
      </a>
    </>
  );
};

export default SkipLinks;
