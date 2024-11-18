import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaletteDetailDialog from './my-components/PaletteDetailDialog';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

const PaletteDisplay = ({ palettes = defaultPalettes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize palette types for select dropdown
  const paletteTypes = useMemo(() =>
    ['all', ...new Set(palettes.map(p => p.type))],
    [palettes]
  );

  // Memoize filtered palettes
  const filteredPalettes = useMemo(() => {
    return palettes.filter(palette => {
      const matchesSearch = palette.palette.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || palette.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [palettes, debouncedSearchTerm, selectedType]);

  // Calculate the number of columns based on viewport width
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  // Update column count on window resize
  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate rows for virtualization
  const rowCount = Math.ceil(filteredPalettes.length / columnCount);

  // Set up virtualizer using window scroll
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 180, // Estimated row height
    overscan: 5,
  });

  // URL hash handling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const palette = palettes.find(p => p.id === decodeURIComponent(hash));
        if (palette) {
          setSelectedPalette(palette);
        }
      } else {
        setSelectedPalette(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [palettes]);

  const handlePaletteSelect = (e, palette) => {
    e.preventDefault();
    window.location.hash = encodeURIComponent(palette.id);
  };

  const handlePaletteClose = () => {
    history.pushState('', document.title, window.location.pathname + window.location.search);
    setSelectedPalette(null);
  };

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

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const startIndex = virtualRow.index * columnCount;
            const rowPalettes = filteredPalettes.slice(startIndex, startIndex + columnCount);

            return (
              <div
                key={virtualRow.index}
                className={`absolute left-0 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
              >
                {rowPalettes.map((palette) => (
                  <a
                    onClick={(e) => handlePaletteSelect(e, palette)}
                    key={palette.id}
                    href={`#${encodeURIComponent(palette.id)}`}
                  >
                    <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="relative">
                          <span className="text-sm text-gray-400 absolute top-1 right-0">
                            &#123;{palette.package}&#125; • {palette.length} • {palette.type}
                          </span>
                          <span className="text-xl font-semibold relative inline-block bg-white pr-3">
                            {palette.palette}
                          </span>
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
            );
          })}
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