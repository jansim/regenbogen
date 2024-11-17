import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const defaultPalettes = [
  {"package":"awtools","palette":"a_palette","length":8,"type":"sequential","id":"awtools::a_palette","colors":["#2A363BFF","#019875FF","#99B898FF","#FECEA8FF","#FF847CFF","#E84A5FFF","#C0392BFF","#96281BFF"]},
  {"package":"awtools","palette":"ppalette","length":8,"type":"qualitative","id":"awtools::ppalette","colors":["#F7DC05FF","#3D98D3FF","#EC0B88FF","#5E35B1FF","#F9791EFF","#3DD378FF","#C6C6C6FF","#444444FF"]},
  {"package":"awtools","palette":"bpalette","length":16,"type":"qualitative","id":"awtools::bpalette","colors":["#C62828FF","#F44336FF","#9C27B0FF","#673AB7FF","#3F51B5FF","#2196F3FF","#29B6F6FF","#006064FF","#009688FF","#4CAF50FF","#8BC34AFF","#FFEB3BFF","#FF9800FF","#795548FF","#9E9E9EFF","#607D8BFF"]},
  {"package":"awtools","palette":"gpalette","length":4,"type":"sequential","id":"awtools::gpalette","colors":["#D6D6D6FF","#ADADADFF","#707070FF","#333333FF"]},
  {"package":"awtools","palette":"mpalette","length":9,"type":"qualitative","id":"awtools::mpalette","colors":["#017A4AFF","#FFCE4EFF","#3D98D3FF","#FF363CFF","#7559A2FF","#794924FF","#8CDB5EFF","#D6D6D6FF","#FB8C00FF"]},
  {"package":"awtools","palette":"spalette","length":6,"type":"qualitative","id":"awtools::spalette","colors":["#9F248FFF","#FFCE4EFF","#017A4AFF","#F9791EFF","#244579FF","#C6242DFF"]}
];

const PaletteDetailDialog = ({ palette, isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showCopiedAll, setShowCopiedAll] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [copiedPreviewIndex, setCopiedPreviewIndex] = useState(null);

  const copyToClipboard = async (text, index = null, isPreview = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isPreview) {
        setCopiedPreviewIndex(index);
        setTimeout(() => setCopiedPreviewIndex(null), 1000);
      } else if (index !== null) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1000);
      } else {
        setShowCopiedAll(true);
        setTimeout(() => setShowCopiedAll(false), 1000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAllColors = () => {
    const colorsList = palette.colors.join(', ');
    copyToClipboard(colorsList);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-auto" style={{ maxHeight: '95vh' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{palette.palette}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                {palette.type} • {palette.length} colors
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyAllColors}
                className="flex items-center gap-2"
              >
                {showCopiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy All
              </Button>
            </div>
          </div>

          <div className="flex h-16 rounded-md overflow-hidden relative">
            {palette.colors.map((color, index) => (
              <div
                key={`preview-${index}`}
                className="flex-1 h-full relative group cursor-pointer hover:z-10 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => copyToClipboard(color, index, true)}
                title={`Click to copy ${color}`}
              >
                {copiedPreviewIndex === index ? (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white">
                    <Check className="w-6 h-6" />
                  </div>
                ) : (
                <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white transition-opacity">
                  <Copy className="w-4 h-4" />
                </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <button
              onClick={() => setIsListExpanded(!isListExpanded)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2 group"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${isListExpanded ? 'rotate-90' : ''}`}
              />
              <span>
                {isListExpanded ? 'Hide' : 'Show'} color details
              </span>
            </button>

            <div className={`space-y-2 transition-all ${isListExpanded ? 'block' : 'hidden'}`}>
              {palette.colors.map((color, index) => (
                <div
                  key={`color-${index}`}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className="w-12 h-12 rounded-md mr-4"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 font-mono">{color}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(color, index)}
                    className="w-24"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="ml-2">
                      {copiedIndex === index ? 'Copied!' : 'Copy'}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {(showCopiedAll) && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <AlertDescription>
                {'All colors copied to clipboard!'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

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

        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredPalettes.length} of {palettes.length} palettes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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