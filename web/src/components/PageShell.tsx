import { Footer } from "./Footer";
import { Header } from "./Header";

const DEFAULT_CLASS = "min-h-screen p-8 pb-20 sm:p-20 text-white";

interface PageShellProps {
  /** Optional centered H1 shown between the header and the page body. */
  title?: string;
  /** Override the wrapper's default padding (e.g. the home page is denser). */
  className?: string;
  children: React.ReactNode;
}

/**
 * Shared layout shell used by every page: top nav, optional title, content,
 * and footer. Renders the same `min-h-screen text-white` container plus the
 * standard `text-center mb-8` title block used by the browsable pages.
 */
export const PageShell: React.FC<PageShellProps> = ({
  title,
  className = DEFAULT_CLASS,
  children,
}) => (
  <div className={className}>
    <Header />
    {title && (
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>
      </div>
    )}
    {children}
    <Footer />
  </div>
);
