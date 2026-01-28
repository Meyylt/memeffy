import React, { useState, useRef, useEffect } from 'react';

const MemeEditor = ({ selectedMeme }) => {
  const [image, setImage] = useState(null);
  
  // Textes classiques (Top/Bottom)
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  
  // Textes libres (Déplaçables)
  const [freeTexts, setFreeTexts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMovingText, setIsMovingText] = useState(false);
  
  const canvasRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  // --- 1. CHARGEMENT IMAGE GALERIE (CORS) ---
  useEffect(() => {
    if (selectedMeme) {
      const img = new Image();
      img.crossOrigin = "anonymous"; 
      
      img.onload = () => {
        setImage(img);
        setTopText("");
        setBottomText("");
        setFreeTexts([]);
        setRotation(0);
      };

      img.onerror = () => {
        // Fallback si erreur CORS
        const fallbackImg = new Image();
        fallbackImg.onload = () => setImage(fallbackImg);
        fallbackImg.src = selectedMeme;
      };

      const cacheBuster = selectedMeme.includes('?') ? '&' : '?';
      img.src = selectedMeme.startsWith('data:') ? selectedMeme : `${selectedMeme}${cacheBuster}t=${Date.now()}`;
    }
  }, [selectedMeme]);

  // --- 2. GESTION DU TEXTE ---
  const addFreeText = () => {
    const newText = { id: Date.now(), content: "NOUVEAU TEXTE", x: 150, y: 150, fontSize: 35 };
    setFreeTexts([...freeTexts, newText]);
    setSelectedId(newText.id);
  };

  const deleteText = () => {
    if (selectedId) {
      setFreeTexts(freeTexts.filter(t => t.id !== selectedId));
      setSelectedId(null);
    }
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const downloadAndSaveMeme = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    try {
      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `memeffy-${Date.now()}.png`;
      link.href = imageData;
      link.click();

      const stored = JSON.parse(localStorage.getItem('my-memeffy-creations')) || [];
      const newCreation = { id: Date.now(), url: imageData, date: new Date().toLocaleDateString() };
      localStorage.setItem('my-memeffy-creations', JSON.stringify([newCreation, ...stored]));
      
      window.dispatchEvent(new Event('storage'));
      alert("Mème enregistré !");
    } catch (err) {
      alert("Image protégée : Téléchargement bloqué par le navigateur.");
    }
  };

  // --- 3. LOGIQUE DE DÉPLACEMENT DU TEXTE (RÉTABLIE) ---
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Détection du clic sur un texte
    const clickedText = freeTexts.find(t => {
      const dx = Math.abs(mouseX - t.x);
      const dy = Math.abs(mouseY - t.y);
      return dx < 100 && dy < 30; // Zone de clic approximative
    });

    if (clickedText) {
      setSelectedId(clickedText.id);
      setIsMovingText(true);
      // Calcul du décalage pour que le texte ne "saute" pas sous la souris
      offset.current = { x: mouseX - clickedText.x, y: mouseY - clickedText.y };
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    // Si on ne déplace pas de texte ou si aucun texte n'est sélectionné, on arrête
    if (!isMovingText || selectedId === null) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Mise à jour de la position du texte sélectionné
    setFreeTexts(prev => prev.map(t => 
      t.id === selectedId 
        ? { ...t, x: mouseX - offset.current.x, y: mouseY - offset.current.y }
        : t
    ));
  };

  const handleMouseUp = () => {
    setIsMovingText(false);
  };

  // --- 4. RENDU CANVAS ---
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = (rotation === 90 || rotation === 270) ? image.height : image.width;
      canvas.height = (rotation === 90 || rotation === 270) ? image.width : image.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      ctx.restore();

      const baseFontSize = canvas.width * 0.08;
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.textAlign = "center";

      ctx.font = `bold ${baseFontSize}px Impact`;
      ctx.lineWidth = baseFontSize / 15;
      ctx.textBaseline = "top";
      ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
      ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);

      ctx.textBaseline = "bottom";
      ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);

      // Dessin des textes libres
      freeTexts.forEach(t => {
        ctx.font = `bold ${t.fontSize}px Impact`;
        ctx.lineWidth = t.fontSize / 15;
        ctx.textBaseline = "middle";
        ctx.fillText(t.content, t.x, t.y);
        ctx.strokeText(t.content, t.x, t.y);
        
        // Cadre de sélection
        if (t.id === selectedId) {
          ctx.strokeStyle = "#00F0FF";
          ctx.lineWidth = 2;
          ctx.strokeRect(t.x - 110, t.y - 30, 220, 60);
        }
      });
    }
  }, [image, topText, bottomText, freeTexts, rotation, selectedId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start font-jost">
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-white">Meme Generator</h2>
          <p className="text-sm text-slate-400 font-medium">
            The fastest way to turn your shower thoughts into memes.
          </p>
        </div>
        
        <div className="space-y-4 max-w-sm">
          <input 
            type="text" placeholder="Top text" value={topText}
            className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-[#00F0FF] transition-all "
            onChange={(e) => setTopText(e.target.value)}
          />
          <input 
            type="text" placeholder="Bottom text" value={bottomText}
            className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-[#00F0FF] transition-all "
            onChange={(e) => setBottomText(e.target.value)}
          />
          
          {selectedId && (
            <div className="flex gap-2">
              <input 
                type="text" autoFocus
                value={freeTexts.find(t => t.id === selectedId)?.content || ""}
                className="flex-1 p-4 bg-[#00F0FF]/10 rounded-xl border border-[#00F0FF] text-white outline-none uppercase"
                onChange={(e) => {
                  setFreeTexts(prev => prev.map(t => t.id === selectedId ? {...t, content: e.target.value.toUpperCase()} : t));
                }}
              />
              <button onClick={deleteText} className="p-4 bg-red-500/20 border border-red-500 rounded-xl hover:bg-red-500/40 text-red-500 font-bold transition-all">✕</button>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={addFreeText} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 border border-slate-700 transition-all group">
            <img src="/icons/texte.png" alt="Add" className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 border border-slate-700 transition-all group">
            <img src="/icons/rotation-de-la-fleche-vers-la-droite.png" alt="Rotate" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center lg:items-start">
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
          className={`w-full max-w-md aspect-square border-2 border-dashed rounded-[2rem] flex items-center justify-center overflow-hidden relative transition-all duration-300 ${
            isDragging ? 'bg-[#00F0FF]/10 border-[#00F0FF] scale-[1.02]' : 'bg-slate-900 border-slate-800'
          }`}
        >
          {!image ? (
            <div className="flex flex-col items-center text-center p-6 pointer-events-none">
              <img src="/icons/appareil-photo.png" alt="Camera" className={`w-16 h-16 mb-4 transition-opacity ${isDragging ? 'opacity-100' : 'opacity-40'}`} />
              <p className="text-lg font-medium mb-4 text-slate-300">
                {isDragging ? "Drop it!" : "No image selected"}
              </p>
              <label className="cursor-pointer bg-[#00F0FF] text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)] pointer-events-auto">
                Upload
                <input type="file" className="hidden" onChange={(e) => processFile(e.target.files[0])} accept="image/*" />
              </label>
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              // ICI : Les événements sont bien attachés au canvas
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full h-auto shadow-2xl rounded-lg cursor-move" 
            />
          )}
        </div>
        
        {image && (
          <div className="flex gap-4 mt-6 w-full max-w-md justify-center">
            <button onClick={downloadAndSaveMeme} className="flex-1 py-3 bg-[#00F0FF] text-black font-bold rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 transition-all text-sm">
              Download PNG
            </button>
            <button className="p-3 bg-slate-800 rounded-full border border-slate-700 group transition-all">
              <img src="/icons/envoyer.png" alt="Send" className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeEditor;