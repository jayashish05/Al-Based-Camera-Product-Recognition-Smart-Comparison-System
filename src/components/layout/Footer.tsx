import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
              UVPS
            </span>
            {" "}— Universal Visual Product Scanner
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">Powered by CLIP + Open Food Facts</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
