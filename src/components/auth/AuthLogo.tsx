import React from "react";

const AuthLogo: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="relative">
          {/* Logo z ciemnym tłem i animacją */}
          <div className="w-34 h-34 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl bg-gray-800 border-2 border-amber-200 hover:shadow-amber-200/50 hover:scale-105 transition-all duration-300 transform">
            <img
              src="/logo.png"
              alt="HovBase Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogo;
