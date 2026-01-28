import React, { useState, useEffect } from 'react';

const MemeGallery = ({ onSelectMeme }) => {
  const [activeTab, setActiveTab] = useState('popular');
  const [savedMemes, setSavedMemes] = useState([]);

  // Charger les créations depuis le localStorage au montage du composant
  useEffect(() => {
    const updateGallery = () => {
      const stored = JSON.parse(localStorage.getItem('my-memeffy-creations')) || [];
      setSavedMemes(stored);
    };

    updateGallery();
    // On écoute les changements du localStorage pour mettre à jour la galerie en temps réel
    window.addEventListener('storage', updateGallery);
    return () => window.removeEventListener('storage', updateGallery);
  }, []);

  const popularMemes = [
    { id: 1, name: "Drake", url: "https://api.imgflip.com/s/meme/Drake-Hotline-Bling.jpg" },
    { id: 2, name: "Distracted Boyfriend", url: "https://api.imgflip.com/s/meme/Distracted-Boyfriend.jpg" },
    { id: 3, name: "Two Buttons", url: "https://api.imgflip.com/s/meme/Two-Buttons.jpg" },
    { id: 4, name: "Doge", url: "https://api.imgflip.com/s/meme/Doge.jpg" },
    { id: 5, name: "Success Kid", url: "https://api.imgflip.com/s/meme/Success-Kid.jpg" },
    { id: 6, name: "Batman vs Superman", url: "https://api.imgflip.com/s/meme/Batman-Smiling.png" },
  ];

  // Sélectionner la liste à afficher
  const currentMemes = activeTab === 'popular' ? popularMemes : savedMemes;

  // Fonction pour supprimer un mème sauvegardé
  const handleDelete = (e, id) => {
    e.stopPropagation(); // Empêche de charger le mème quand on clique sur supprimer
    const updated = savedMemes.filter(m => m.id !== id);
    setSavedMemes(updated);
    localStorage.setItem('my-memeffy-creations', JSON.stringify(updated));
  };

  return (
    <div className="mt-20 space-y-8 font-jost">
      {/* Navigation entre rubriques */}
      <div className="flex gap-8 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('popular')}
          className={`pb-4 text-sm font-bold tracking-widest transition-all ${
            activeTab === 'popular' ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-slate-500 hover:text-white'
          }`}
        >
          POPULAR MEMES
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`pb-4 text-sm font-bold tracking-widest transition-all ${
            activeTab === 'saved' ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-slate-500 hover:text-white'
          }`}
        >
          MY CREATIONS ({savedMemes.length})
        </button>
      </div>

      {/* Grille de mèmes */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {currentMemes.length > 0 ? (
          currentMemes.map((meme) => (
            <div 
              key={meme.id}
              onClick={() => onSelectMeme(meme.url)}
              className="group relative aspect-square bg-slate-900 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-[#00F0FF] transition-all duration-300"
            >
              <img 
                src={meme.url} 
                alt="Meme" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
              />
              
              {/* Bouton supprimer (uniquement dans My Creations) */}
              {activeTab === 'saved' && (
                <button 
                  onClick={(e) => handleDelete(e, meme.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ✕
                </button>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-white text-[10px] font-bold uppercase truncate">
                  {meme.name || `Saved ${meme.date}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500 italic">No memes found in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeGallery;