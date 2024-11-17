import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const defaultPalettes = [
  {"package":"awtools","palette":"a_palette","length":8,"type":"sequential","id":"awtools::a_palette","colors":["#2A363B","#019875","#99B898","#FECEA8","#FF847C","#E84A5F","#C0392B","#96281B"]},
  {"package":"awtools","palette":"ppalette","length":8,"type":"qualitative","id":"awtools::ppalette","colors":["#F7DC05","#3D98D3","#EC0B88","#5E35B1","#F9791E","#3DD378","#C6C6C6","#444444"]},
  {"package":"awtools","palette":"bpalette","length":16,"type":"qualitative","id":"awtools::bpalette","colors":["#C62828","#F44336","#9C27B0","#673AB7","#3F51B5","#2196F3","#29B6F6","#006064","#009688","#4CAF50","#8BC34A","#FFEB3B","#FF9800","#795548","#9E9E9E","#607D8B"]},
  {"package":"awtools","palette":"gpalette","length":4,"type":"sequential","id":"awtools::gpalette","colors":["#D6D6D6","#ADADAD","#707070","#333333"]},
  {"package":"awtools","palette":"mpalette","length":9,"type":"qualitative","id":"awtools::mpalette","colors":["#017A4A","#FFCE4E","#3D98D3","#FF363C","#7559A2","#794924","#8CDB5E","#D6D6D6","#FB8C00"]},
  {"package":"awtools","palette":"spalette","length":6,"type":"qualitative","id":"awtools::spalette","colors":["#9F248F","#FFCE4E","#017A4A","#F9791E","#244579","#C6242D"]}
];

// Color blindness simulation matrices
const colorblindnessTypes = {
  protanopia: [
    0.567, 0.433, 0, 0, 0,
    0.558, 0.442, 0, 0, 0,
    0, 0.242, 0.758, 0, 0,
    0, 0, 0, 1, 0
  ],
  deuteranopia: [
    0.625, 0.375, 0, 0, 0,
    0.7, 0.3, 0, 0, 0,
    0, 0.3, 0.7, 0, 0,
    0, 0, 0, 1, 0
  ],
  tritanopia: [
    0.95, 0.05, 0, 0, 0,
    0, 0.433, 0.567, 0, 0,
    0, 0.475, 0.525, 0, 0,
    0, 0, 0, 1, 0
  ],
  achromatopsia: [
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0, 0, 0, 1, 0
  ]
};

const hexToRgb = (hex, float = true) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (float) {
    return [r / 255, g / 255, b / 255];
  } else {
    return [r, g, b];
  }
}


const simulateColorBlindness = (color, type) => {
  if (!colorblindnessTypes[type]) {
    throw new Error(`Invalid color blindness type: ${type}`);
  }

  // Convert hex to RGB
  const [r, g, b] = hexToRgb(color);

  const matrix = colorblindnessTypes[type];

  // Apply color transformation
  const newR = matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3];
  const newG = matrix[5] * r + matrix[6] * g + matrix[7] * b + matrix[8];
  const newB = matrix[10] * r + matrix[11] * g + matrix[12] * b + matrix[13];

  // Convert back to hex
  const toHex = (n) => {
    const intVal = Math.round(Math.max(0, Math.min(1, n)) * 255); // Clamp and scale
    return intVal.toString(16).padStart(2, '0');
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

const ColorblindPreview = ({ colors, type }) => {
  const simulatedColors = colors.map(color => simulateColorBlindness(color, type));

  return (
    <div className="space-y-2">
      <div className="flex h-16 rounded-md overflow-hidden">
        {simulatedColors.map((color, index) => (
          <div
            key={index}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
            title={`Original: ${colors[index]}\nSimulated: ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

const PaletteDetailDialog = ({ palette, isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showCopiedAll, setShowCopiedAll] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [copiedPreviewIndex, setCopiedPreviewIndex] = useState(null);
  const [selectedView, setSelectedView] = useState('normal');

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
                &#123;{palette.package}&#125; • {palette.length} colors • {palette.type}
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
                  <div className="flex gap-2 flex-1">
                    <div
                      className="w-12 h-12 rounded-md"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex flex-col justify-center">
                      <span className="font-mono">{color}</span>
                      <span className="font-mono text-sm text-gray-500">
                        rgb({hexToRgb(color, false).join(', ')})
                      </span>
                    </div>
                  </div>
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

          <Tabs defaultValue="achromatopsia" value={selectedView} onValueChange={setSelectedView}>
            <TabsList className="mb-4">
              <TabsTrigger value="achromatopsia">Achromatopsia</TabsTrigger>
              <TabsTrigger value="protanopia">Protanopia</TabsTrigger>
              <TabsTrigger value="deuteranopia">Deuteranopia</TabsTrigger>
              <TabsTrigger value="tritanopia">Tritanopia</TabsTrigger>
            </TabsList>

            <TabsContent value="achromatopsia">
              <ColorblindPreview colors={palette.colors} type="achromatopsia" />
              <div className="text-sm text-gray-500 mt-1">
                Complete color blindness; vision is entirely in grayscale.
              </div>
            </TabsContent>

            <TabsContent value="protanopia">
              <ColorblindPreview colors={palette.colors} type="protanopia" />
              <div className="text-sm text-gray-500 mt-1">
                Red-blindness; difficulty distinguishing reds and greens due to lack of red cone function.
              </div>
            </TabsContent>

            <TabsContent value="deuteranopia">
              <ColorblindPreview colors={palette.colors} type="deuteranopia" />
              <div className="text-sm text-gray-500 mt-1">
                Green-blindness; difficulty distinguishing reds and greens due to lack of green cone function.
              </div>
            </TabsContent>

            <TabsContent value="tritanopia">
              <ColorblindPreview colors={palette.colors} type="tritanopia" />
              <div className="text-sm text-gray-500 mt-1">
                Blue-yellow blindness; difficulty distinguishing blues and yellows due to lack of blue cone function.
              </div>
            </TabsContent>
          </Tabs>

          {showCopiedAll && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <AlertDescription>
                All colors copied to clipboard!
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