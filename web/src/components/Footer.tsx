import Link from "next/link";
import { FaGithub, FaHeart, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Routes } from "../constants/routes";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full text-white">
      <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 pt-4 pb-0">
        <nav aria-label="Footer" className="flex gap-4 items-center text-sm">
          <Link
            href={Routes.HOME}
            className="hover:underline text-white/80 hover:text-white"
          >
            Home
          </Link>
          <Link
            href={Routes.CREATE}
            className="hover:underline text-white/80 hover:text-white"
          >
            Create
          </Link>
          <Link
            href={Routes.BROWSE}
            className="hover:underline text-white/80 hover:text-white"
          >
            Browse
          </Link>
        </nav>

        <a
          href="https://github.com/marc-aurele-besner/eternalmint-xyz"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Eternal Mint GitHub repository"
          className="flex items-center gap-2"
        >
          <FaGithub size={24} aria-hidden="true" />
          <span>GitHub Repo</span>
        </a>

        <p className="flex items-center gap-2">
          Made with <FaHeart className="text-red-500" aria-hidden="true" /> by
          Marc-Aurèle
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/marc-aurele-besner"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Marc-Aurèle Besner on GitHub"
          >
            <FaGithub
              className="text-white hover:text-gray-400"
              size={24}
              aria-hidden="true"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/marc-aurele-besner/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Marc-Aurèle Besner on LinkedIn"
          >
            <FaLinkedin
              className="text-white hover:text-gray-400"
              size={24}
              aria-hidden="true"
            />
          </a>
          <a
            href="https://x.com/marcaureleb"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Marc-Aurèle Besner on X (Twitter)"
          >
            <FaTwitter
              className="text-white hover:text-gray-400"
              size={24}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};