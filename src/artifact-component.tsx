import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaletteDetailDialog from "./my-components/PaletteDetailDialog";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Plot from "./my-components/Plot";
import ColorblindIndicator from "./my-components/ColorblindIndicator";
import { isColorblindFriendly } from "./colorblindCheck";

// Short labels for palette types
const typeAbbreviations = {
  qualitative: "qual",
  divergent: "div",
  sequential: "seq",
};

// Upper end of the number of colors slider, means "or more"
const MAX_COLORS = 20;

const sortOptions = {
  random: "Random",
  colorblind: "Colorblind safety",
  name: "Name",
  colors: "Number of colors",
};

const PaletteDisplay = ({ palettes, plotType }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("qualitative");
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [colorblindOnly, setColorblindOnly] = useState(false);

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("random");
  const [colorRange, setColorRange] = useState([1, MAX_COLORS]);
  const [cranOnly, setCranOnly] = useState(false);
  const activeAdvancedCount =
    Number(sortBy !== "random") +
    Number(colorRange[0] !== 1 || colorRange[1] !== MAX_COLORS) +
    Number(cranOnly);

  // Plot types to cycle through when plotType is set to 'mixed' (should not be a multiple of 3 ideally)
  const mixedPlotTypes = ["bar", "area", "boxplot", "line", "scatter"];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize palette types for select dropdown
  const paletteTypes = ["all", "qualitative", "divergent", "sequential"];

  // Memoize filtered and sorted palettes
  const filteredPalettes = useMemo(() => {
    const filtered = palettes.filter((palette) => {
      const matchesSearch =
        palette.palette
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        palette.package
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || palette.type === selectedType;
      const matchesColorblind =
        !colorblindOnly || isColorblindFriendly(palette.cvd);
      const nColors = palette.colors.length;
      const matchesColors =
        nColors >= colorRange[0] &&
        (colorRange[1] === MAX_COLORS || nColors <= colorRange[1]);
      const matchesCran = !cranOnly || palette.cran;
      return (
        matchesSearch &&
        matchesType &&
        matchesColorblind &&
        matchesColors &&
        matchesCran
      );
    });

    // Palettes are already shuffled, so "random" keeps the order
    if (sortBy === "colorblind") {
      filtered.sort((a, b) => (b.cvd ?? -1) - (a.cvd ?? -1));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.palette.localeCompare(b.palette));
    } else if (sortBy === "colors") {
      filtered.sort((a, b) => a.colors.length - b.colors.length);
    }
    return filtered;
  }, [
    palettes,
    debouncedSearchTerm,
    selectedType,
    colorblindOnly,
    colorRange,
    cranOnly,
    sortBy,
  ]);

  // Calculate the number of columns based on viewport width
  const getColumnCount = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [columnCount, setColumnCount] = useState(getColumnCount());

  // Update column count on window resize
  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getColumnCount]);

  // Calculate rows for virtualization
  const rowCount = Math.ceil(filteredPalettes.length / columnCount);

  // Dynamically adjust estimated row height based on plot type
  const getEstimatedRowHeight = () => {
    return plotType === "palette" ? 160 : 400;
  };

  // Key change: include plotType in dependencies to force re-creation when plot type changes
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => getEstimatedRowHeight(),
    overscan: 5,
    gap: 24,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [plotType]);

  // URL hash handling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const palette = palettes.find((p) => p.id === decodeURIComponent(hash));
        if (palette) {
          setSelectedPalette(palette);
        }
      } else {
        setSelectedPalette(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [palettes]);

  const handlePaletteSelect = (e, palette) => {
    e.preventDefault();
    window.location.hash = encodeURIComponent(palette.id);
  };

  const handlePaletteClose = () => {
    history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search,
    );
    setSelectedPalette(null);
  };

  const resetAdvanced = () => {
    setSortBy("random");
    setColorRange([1, MAX_COLORS]);
    setCranOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-24" />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-6 justify-center lg:justify-between">
          <Input
            placeholder="Search palettes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <div className="flex flex-wrap">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              Palette Type
            </div>
            <RadioGroup
              value={selectedType}
              onValueChange={setSelectedType}
              className="flex mx-3 space-x-2"
            >
              {paletteTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={`type-${type}`} />
                  <Label
                    htmlFor={`type-${type}`}
                    className="capitalize cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="colorblind-only"
                checked={colorblindOnly}
                onCheckedChange={setColorblindOnly}
              />
              <Label htmlFor="colorblind-only" className="cursor-pointer">
                Colorblind friendly
              </Label>
            </div>
            <Button
              variant={showAdvanced ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Advanced
              {activeAdvancedCount > 0 && (
                <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-1.5">
                  {activeAdvancedCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[auto_1fr_auto_auto] items-center mb-6 p-4 rounded-lg border bg-white text-sm">
            <div className="flex items-center gap-3">
              <Label htmlFor="sort-by" className="text-gray-500 shrink-0">
                Sort by
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sortOptions).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-gray-500 shrink-0">Colors</Label>
              <Slider
                min={1}
                max={MAX_COLORS}
                step={1}
                value={colorRange}
                onValueChange={setColorRange}
                className="min-w-[140px]"
                aria-label="Number of colors"
              />
              <span className="font-mono text-gray-500 w-14 shrink-0">
                {colorRange[0]}–{colorRange[1]}
                {colorRange[1] === MAX_COLORS && "+"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="cran-only"
                checked={cranOnly}
                onCheckedChange={setCranOnly}
              />
              <Label htmlFor="cran-only" className="cursor-pointer">
                On CRAN only
              </Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAdvanced}
              disabled={activeAdvancedCount === 0}
            >
              Reset
            </Button>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4 lg:text-center">
          Showing {filteredPalettes.length} of {palettes.length} palettes
        </p>

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columnCount;
            const rowPalettes = filteredPalettes.slice(
              startIndex,
              startIndex + columnCount,
            );

            return (
              <div
                key={virtualRow.index}
                className={`absolute left-0 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-shifted`}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {rowPalettes.map((palette, paletteIndexInRow) => (
                  <a
                    onClick={(e) => handlePaletteSelect(e, palette)}
                    key={palette.id}
                    href={`#${encodeURIComponent(palette.id)}`}
                  >
                    <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                      <CardHeader className="pt-4 pb-2">
                        <div className="relative">
                          <span className="text-sm text-gray-400 absolute top-1 right-0 flex items-center gap-1">
                            &#123;{palette.package}&#125; • {palette.length} •{" "}
                            {typeAbbreviations[palette.type] ?? palette.type}
                            {palette.cvd !== undefined && (
                              <>
                                {" "}
                                •
                                <ColorblindIndicator
                                  friendly={isColorblindFriendly(palette.cvd)}
                                  minDist={palette.cvd / 10}
                                />
                              </>
                            )}
                          </span>
                          <span className="text-xl text-gray-600 relative inline-block bg-white pr-3">
                            {palette.palette}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {plotType === "palette" ? (
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
                        ) : (
                          <Plot
                            colors={palette.colors}
                            type={
                              plotType === "mixed"
                                ? mixedPlotTypes[
                                    (startIndex + paletteIndexInRow) %
                                      mixedPlotTypes.length
                                  ]
                                : plotType
                            }
                          ></Plot>
                        )}
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
