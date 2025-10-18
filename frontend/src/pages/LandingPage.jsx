import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sword, Shield, Users, Trophy } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const handleDiscordLogin = () => {
    window.location.href = `${API}/auth/discord`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sword className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              BDO Guild
            </h1>
            <Shield className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Sistema de gestión para miembros del gremio Black Desert Online
          </p>
        </header>

        {/* Login Section */}
        <div className="max-w-md mx-auto mb-20 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <Card className="glass-dark p-8 rounded-2xl shadow-2xl border-purple-500/20">
            <h2 className="text-2xl font-bold text-center mb-6 text-white">
              Inicia Sesión
            </h2>
            <p className="text-center text-gray-400 mb-8 text-sm">
              Conecta tu cuenta para acceder al sistema de gestión del gremio
            </p>
            
            <div className="space-y-4">
              <Button
                data-testid="discord-login-btn"
                onClick={handleDiscordLogin}
                className="w-full h-14 text-lg font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#5865F2]/50"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Conectar con Discord
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-500">o</span>
                </div>
              </div>

              <Button
                data-testid="google-login-btn"
                onClick={handleGoogleLogin}
                className="w-full h-14 text-lg font-semibold bg-white hover:bg-gray-100 text-gray-900 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Conectar con Google
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              Solo miembros del gremio pueden acceder
            </p>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
          <Card className="glass-dark p-6 rounded-xl border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <Users className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Gestión de Miembros</h3>
              <p className="text-gray-400 text-sm">
                Administra los datos de todos los miembros del gremio en un solo lugar
              </p>
            </div>
          </Card>

          <Card className="glass-dark p-6 rounded-xl border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <Trophy className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Stats PvP</h3>
              <p className="text-gray-400 text-sm">
                Visualiza y actualiza tus estadísticas de combate y gear score
              </p>
            </div>
          </Card>

          <Card className="glass-dark p-6 rounded-xl border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <Shield className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Acceso Seguro</h3>
              <p className="text-gray-400 text-sm">
                Sistema de autenticación con Discord y Google para máxima seguridad
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
