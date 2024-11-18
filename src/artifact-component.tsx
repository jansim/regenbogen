import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaletteDetailDialog from './my-components/PaletteDetailDialog'

const defaultPalettes = [
  {"package":"awtools","palette":"a_palette","length":8,"type":"sequential","id":"awtools::a_palette","colors":["#2A363B","#019875","#99B898","#FECEA8","#FF847C","#E84A5F","#C0392B","#96281B"]},
  {"package":"awtools","palette":"ppalette","length":8,"type":"qualitative","id":"awtools::ppalette","colors":["#F7DC05","#3D98D3","#EC0B88","#5E35B1","#F9791E","#3DD378","#C6C6C6","#444444"]},
  {"package":"awtools","palette":"bpalette","length":16,"type":"qualitative","id":"awtools::bpalette","colors":["#C62828","#F44336","#9C27B0","#673AB7","#3F51B5","#2196F3","#29B6F6","#006064","#009688","#4CAF50","#8BC34A","#FFEB3B","#FF9800","#795548","#9E9E9E","#607D8B"]},
  {"package":"awtools","palette":"gpalette","length":4,"type":"sequential","id":"awtools::gpalette","colors":["#D6D6D6","#ADADAD","#707070","#333333"]},
  {"package":"awtools","palette":"mpalette","length":9,"type":"qualitative","id":"awtools::mpalette","colors":["#017A4A","#FFCE4E","#3D98D3","#FF363C","#7559A2","#794924","#8CDB5E","#D6D6D6","#FB8C00"]},
  {"package":"awtools","palette":"spalette","length":6,"type":"qualitative","id":"awtools::spalette","colors":["#9F248F","#FFCE4E","#017A4A","#F9791E","#244579","#C6242D"]}
];

const PaletteDisplay = ({ palettes = defaultPalettes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPalette, setSelectedPalette] = useState<any>(null);

  useEffect(() => {
    // Check URL hash for palette on mount
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        const palette = palettes.find(p => p.id === decodeURIComponent(hash));
        if (palette) {
          setSelectedPalette(palette);
        }
      } else {
        setSelectedPalette(null);
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [palettes]);

  const handlePaletteSelect = (e, palette) => {
    e.preventDefault();
    // Update hash without page reload
    window.location.hash = encodeURIComponent(palette.id);
  };

  const handlePaletteClose = () => {
    // Clear hash without page reload
    history.pushState('', document.title, window.location.pathname + window.location.search);
    setSelectedPalette(null);
  };

  const paletteTypes = ['all', ...new Set(palettes.map(p => p.type))];

  const filteredPalettes = palettes.filter(palette => {
    const matchesSearch = palette.palette.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || palette.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              Regenbogen
              <img className="w-12 ml-3 inline-block relative" src="logo.svg" style={{bottom: '0.12em'}}/>
            </h1>
            <div className="flex gap-4">
              <Input
                placeholder="Search palettes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {paletteTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="h-24" />

        <p className="text-sm text-gray-500 mb-4 lg:text-center">
          Showing {filteredPalettes.length} of {palettes.length} palettes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 grid-shifted">
          {filteredPalettes.map((palette) => (
            <a onClick={(e) => handlePaletteSelect(e, palette)} key={palette.id} href={`#${encodeURIComponent(palette.id)}`}>
              <Card
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="relative">
                    <span className="text-sm text-gray-400 absolute top-1 right-0">
                    &#123;{palette.package}&#125; • {palette.length} • {palette.type}
                    </span>
                    <span className="text-xl font-semibold relative inline-block bg-white pr-3">{palette.palette}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex h-12 rounded-md overflow-hidden">
                    {palette.colors.map((color, index) => (
                      <div
                        key={`${palette.id}-${index}`}
                        className="flex-1 h-full"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {filteredPalettes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No palettes found matching your criteria
          </div>
        )}

        {selectedPalette && (
          <PaletteDetailDialog
            palette={selectedPalette}
            isOpen={!!selectedPalette}
            onClose={handlePaletteClose}
          />
        )}
      </div>
    </div>
  );
};

export default PaletteDisplay;
