import React from "react";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-gray-900 text-gray-300 ${className}`}
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informacje o aplikacji */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="HovBase Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold text-amber-400">
                HovBase
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Profesjonalna platforma do zarządzania wystawami psów rasowych.
              Organizuj, rejestruj i oceniaj psy w jednym miejscu.
            </p>
          </div>

          {/* Szybkie linki */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">
              Szybkie linki
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  data-testid="footer-dashboard-link"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/shows"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  data-testid="footer-shows-link"
                >
                  Wystawy
                </a>
              </li>
              <li>
                <a
                  href="/dogs"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  data-testid="footer-dogs-link"
                >
                  Psy
                </a>
              </li>
            </ul>
          </div>

          {/* Kontakt i wsparcie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">Wsparcie</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/auth/login"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  data-testid="footer-login-link"
                >
                  Zaloguj się
                </a>
              </li>
              <li>
                <a
                  href="/auth/signup"
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  data-testid="footer-signup-link"
                >
                  Zarejestruj się
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-400">
                  Email: support@hovbase.pl
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dolna sekcja */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} HovBase. Wszystkie prawa zastrzeżone.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <span className="text-gray-400">Polityka prywatności</span>
              <span className="text-gray-400">Regulamin</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
