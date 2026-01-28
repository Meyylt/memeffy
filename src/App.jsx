import React, { useState } from 'react'
import MemeEditor from './components/MemeEditor'
import MemeGallery from './components/MemeGallery'

function App() {
  // État pour stocker l'URL de l'image sélectionnée dans la galerie
  const [selectedMemeUrl, setSelectedMemeUrl] = useState(null);

  // Fonction pour charger l'image de la galerie dans l'éditeur
  const handleSelectMeme = (url) => {
    setSelectedMemeUrl(url);
    // Remonte la page doucement vers l'éditeur
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-jost">
      {/* Barre de navigation (Links supprimés) */}
      <nav className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-tighter cursor-pointer" onClick={() => window.location.reload()}>
          Meme<span className="text-[#00F0FF]">ffy</span>
        </h1>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-20">
        {/* Éditeur de Mèmes */}
        <section>
          <MemeEditor selectedMeme={selectedMemeUrl} />
        </section>

        {/* Galerie (Populaires + Créations sauvegardées) */}
        <section>
          <MemeGallery onSelectMeme={handleSelectMeme} />
        </section>
      </main>

      {/* Footer */}
      <footer className="p-10 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Memeffy - Created by an Algerian student in Corsica</p>
      </footer>
    </div>
  )
}

export default App