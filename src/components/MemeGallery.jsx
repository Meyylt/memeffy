import React, { useState, useEffect } from 'react';

const MemeGallery = ({ onSelectMeme }) => {
  const [activeTab, setActiveTab] = useState('popular');
  const [savedMemes, setSavedMemes] = useState([]); 
  const [cloudMemes, setCloudMemes] = useState([]); 

  // Récupérer l'utilisateur connecté depuis le localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchAllData = async () => {
    // 1. Local
    const rawData = localStorage.getItem('my-memeffy-creations');
    const stored = JSON.parse(rawData) || [];
    setSavedMemes(stored);

    // 2. Cloud
    try {
      const response = await fetch('http://localhost:5000/api/memes/all');
      if (response.ok) {
        const data = await response.json();
        setCloudMemes(data);
      }
    } catch (err) {
      console.error("Erreur Cloud:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    window.addEventListener('storage', fetchAllData);
    return () => window.removeEventListener('storage', fetchAllData);
  }, []);

  const popularMemes = [
    { id: 'p1', name: "Drake", url: "https://api.imgflip.com/s/meme/Drake-Hotline-Bling.jpg" },
    { id: 'p2', name: "Distracted Boyfriend", url: "https://api.imgflip.com/s/meme/Distracted-Boyfriend.jpg" },
    { id: 'p3', name: "Two Buttons", url: "https://api.imgflip.com/s/meme/Two-Buttons.jpg" },
    { id: 'p4', name: "Doge", url: "https://api.imgflip.com/s/meme/Doge.jpg" },
    { id: 'p5', name: "Success Kid", url: "https://api.imgflip.com/s/meme/Success-Kid.jpg" },
    { id: 'p6', name: "Batman vs Superman", url: "https://api.imgflip.com/s/meme/Batman-Smiling.png" },
  ];

  const handleDelete = async (e, meme) => {
    e.stopPropagation(); 
    const token = localStorage.getItem('token');
    
    const confirmDelete = window.confirm("Supprimer définitivement ce mème ?");
    if (!confirmDelete) return;

    if (activeTab === 'saved') {
      const updated = savedMemes.filter(m => m.id !== meme.id);
      setSavedMemes(updated);
      localStorage.setItem('my-memeffy-creations', JSON.stringify(updated));
    } 
    else if (activeTab === 'cloud') {
      try {
        const response = await fetch(`http://localhost:5000/api/memes/${meme._id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token } // On envoie le token pour la sécurité
        });
        if (response.ok) {
          setCloudMemes(cloudMemes.filter(m => m._id !== meme._id));
        }
      } catch (err) {
        console.error("Erreur suppression cloud:", err);
      }
    }
  };

  let currentMemes = [];
  if (activeTab === 'popular') currentMemes = popularMemes;
  else if (activeTab === 'cloud') currentMemes = cloudMemes;
  else if (activeTab === 'saved') currentMemes = savedMemes;

  return (
    <div className="mt-20 space-y-8 font-jost">
      <div className="flex gap-8 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {['popular', 'cloud', 'saved'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs font-bold tracking-widest transition-all uppercase ${
              activeTab === tab ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab === 'popular' ? 'Templates' : tab === 'cloud' ? 'Community' : 'My Creations'} 
            {tab === 'saved' && ` (${savedMemes.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {currentMemes.length > 0 ? (
          currentMemes.map((meme, index) => {
            const imgSource = meme.imageUrl || meme.url || meme.data; 
            const uniqueId = meme._id || meme.id || `temp-${index}`;
            
            // LOGIQUE DE PERMISSION : On vérifie si l'utilisateur est l'auteur
            const isAuthor = activeTab === 'cloud' && currentUser && meme.authorName === currentUser.username;
            const canDelete = activeTab === 'saved' || isAuthor;

            if (!imgSource) return null;

            return (
              <div 
                key={uniqueId}
                onClick={() => onSelectMeme(imgSource)}
                className="group relative aspect-square bg-slate-900 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-[#00F0FF] transition-all duration-300 shadow-xl"
              >
                <img 
                  src={imgSource} 
                  alt="Meme" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                />
                
                {/* Bouton supprimer sécurisé */}
                {canDelete && (
                  <button 
                    onClick={(e) => handleDelete(e, meme)}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-[#00F0FF] text-[8px] font-black uppercase tracking-widest mb-1">
                    {activeTab === 'cloud' ? `By ${meme.authorName || 'Anon'}` : 'Creation'}
                  </p>
                  <p className="text-white text-[10px] font-bold uppercase truncate">
                    {meme.name || meme.topText || 'Meme'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 italic">
            Aucun mème trouvé dans cette section.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeGallery;