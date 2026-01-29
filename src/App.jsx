import React, { useState, useEffect } from 'react'
import MemeEditor from './components/MemeEditor'
import MemeGallery from './components/MemeGallery'
import Auth from './components/Auth'; // Vérifie bien le chemin du fichier

function App() {
  // --- ÉTAT DE L'UTILISATEUR ---
  // On initialise l'état avec les données du localStorage si elles existent
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [selectedMemeUrl, setSelectedMemeUrl] = useState(null);

  // --- GESTION DE LA DÉCONNEXION ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload(); // Pour bien réinitialiser l'état global
  };

  const handleSelectMeme = (url) => {
    setSelectedMemeUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-jost">
      {/* Barre de navigation dynamique */}
      <nav className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-tighter cursor-pointer" onClick={() => window.location.reload()}>
          Meme<span className="text-[#00F0FF]">ffy</span>
        </h1>

        {/* Affichage des infos user si connecté */}
        {user && (
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Logged in as</p>
              <p className="text-sm font-bold text-[#00F0FF]">{user.username}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all"
            >
              LOGOUT
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-20">
        {!user ? (
          /* SI PAS CONNECTÉ : On affiche le formulaire Auth */
          <section className="py-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4">Ready to meme?</h2>
              <p className="text-slate-400">Sign in to save your creations to the community cloud.</p>
            </div>
            <Auth onLoginSuccess={(userData) => setUser(userData)} />
          </section>
        ) : (
          /* SI CONNECTÉ : On affiche l'application */
          <>
            <section>
              <MemeEditor selectedMeme={selectedMemeUrl} />
            </section>

            <section>
              <MemeGallery onSelectMeme={handleSelectMeme} />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="p-10 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Memeffy - Created by an Algerian student in Corsica</p>
      </footer>
    </div>
  )
}

export default App