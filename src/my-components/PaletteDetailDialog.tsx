import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, ChevronRight, Github } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import Plot from "./Plot";
import { hexToRgb, simulateColorBlindnessArray } from "@/colorBlindness"
import ColorblindPreview from "./ColorBlindPreview"

const defaultPalette = {
  package: "awtools",
  palette: "a_palette",
  length: 8,
  type: "sequential",
  id: "awtools::a_palette",
  colors: [
    "#2A363B",
    "#019875",
    "#99B898",
    "#FECEA8",
    "#FF847C",
    "#E84A5F",
    "#C0392B",
    "#96281B",
  ],
  gh: "awhstin/awtools",
  cran: false,
};


const PaletteDetailDialog = ({
  palette = defaultPalette,
  isOpen = true,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showCopiedAll, setShowCopiedAll] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [copiedPreviewIndex, setCopiedPreviewIndex] = useState<number | null>(
    null,
  );
  const [selectedView, setSelectedView] = useState("none");

  const plotTypes = ["bar", "line", "scatter", "area", "boxplot", "map"];

  const [copiedCodeExample, setCopiedCodeExample] = useState<string | null>(null);

  const copyToClipboard = async (
    text,
    index: number | null = null,
    isPreview = false,
    codeType: string | null = null
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (codeType) {
        setCopiedCodeExample(codeType);
        setTimeout(() => setCopiedCodeExample(null), 1000);
      } else if (isPreview) {
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
      console.error("Failed to copy:", err);
    }
  };

  const copyAllColors = () => {
    const colorsList = palette.colors.join(", ");
    copyToClipboard(colorsList);
  };

  const getRCode = () => {
    if (palette.cran) {
      return `# Install the package if needed
install.packages("${palette.package}")
library(${palette.package})

# Use the palette
${palette.palette}(${palette.length})

# Use with ggplot2
library(ggplot2)
ggplot(data, aes(x, y, fill = group)) +
  scale_fill_manual(values = ${palette.palette}(${palette.length}))`;
    } else if (palette.gh) {
      return `# Install from GitHub
remotes::install_github("${palette.gh}")
library(${palette.package})

# Use the palette
${palette.palette}(${palette.length})

# Use with ggplot2
library(ggplot2)
ggplot(data, aes(x, y, fill = group)) +
  scale_fill_manual(values = ${palette.palette}(${palette.length}))`;
    }
    return "";
  };

  const getPythonCode = () => `# Define the color palette
colors = ${JSON.stringify(palette.colors, null, 2)}

# Use with Matplotlib
import matplotlib.pyplot as plt

# For sequential data
plt.style.use('default')
for i, color in enumerate(colors):
    plt.plot(data[i], color=color)

# For categorical data
plt.bar(x, height, color=colors)

# Use with Seaborn
import seaborn as sns

# Set palette for all plots
sns.set_palette(colors)

# Or use in specific plots
sns.barplot(data=df, x='category', y='value', palette=colors)`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl overflow-auto"
        style={{ maxHeight: "95vh" }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl">
          <span className="text-gray-400 font-light">{palette.package}::</span><span className="font-semibold">{palette.palette}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  {palette.gh && (
                    <a
                      href={`https://github.com/${palette.gh}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Github className="w-4 h-4" />
                      {palette.gh}
                    </a>
                  )}
                  {palette.cran && (
                    <a
                      href={`https://cran.r-project.org/package=${palette.package}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <span className="font-bold">R</span>
                      CRAN: &#123;{palette.package}&#125;
                    </a>
                  )}
                  <p className="text-sm text-gray-500">
                    {palette.length} colors •{" "}
                    {palette.type}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyAllColors}
                  className="flex items-center gap-2"
                >
                  {showCopiedAll ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy All
                </Button>
              </div>
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
                className={`w-4 h-4 transition-transform ${isListExpanded ? "rotate-90" : ""}`}
              />
              <span>{isListExpanded ? "Hide" : "Show"} color details</span>
            </button>

            <div
              className={`space-y-2 transition-all ${isListExpanded ? "block" : "hidden"}`}
            >
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
                        rgb({hexToRgb(color, false).join(", ")})
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
                      {copiedIndex === index ? "Copied!" : "Copy"}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mt-8 mb-4">Colorblindness</h3>

            <Tabs
              defaultValue="achromatopsia"
              value={selectedView}
              onValueChange={setSelectedView}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="none">None</TabsTrigger>
                <TabsTrigger value="achromatopsia">Achromatopsia</TabsTrigger>
                <TabsTrigger value="protanopia">Protanopia</TabsTrigger>
                <TabsTrigger value="deuteranopia">Deuteranopia</TabsTrigger>
                <TabsTrigger value="tritanopia">Tritanopia</TabsTrigger>
              </TabsList>

              <TabsContent value="none">
                <div className="text-sm text-gray-500 mt-1">
                  Colors don't look the same to all people. Choose a type of
                  color blindness above to simulate how the palette appears to
                  people with this form of color vision deficiency.
                </div>
              </TabsContent>

              <TabsContent value="achromatopsia">
                <ColorblindPreview
                  colors={palette.colors}
                  type="achromatopsia"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Complete color blindness; vision is entirely in grayscale.
                </div>
              </TabsContent>

              <TabsContent value="protanopia">
                <ColorblindPreview colors={palette.colors} type="protanopia" />
                <div className="text-sm text-gray-500 mt-1">
                  Red-blindness; difficulty distinguishing reds and greens due
                  to lack of red cone function.
                </div>
              </TabsContent>

              <TabsContent value="deuteranopia">
                <ColorblindPreview
                  colors={palette.colors}
                  type="deuteranopia"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Green-blindness; difficulty distinguishing reds and greens due
                  to lack of green cone function.
                </div>
              </TabsContent>

              <TabsContent value="tritanopia">
                <ColorblindPreview colors={palette.colors} type="tritanopia" />
                <div className="text-sm text-gray-500 mt-1">
                  Blue-yellow blindness; difficulty distinguishing blues and
                  yellows due to lack of blue cone function.
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h3 className="text-lg font-semibold mt-8 mb-4">Plot Previews</h3>
            <div className="grid grid-cols-3 gap-4">
              {plotTypes.map((type) => (
                <Plot
                  key={type}
                  type={type}
                  colors={simulateColorBlindnessArray(
                    palette.colors,
                    selectedView,
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mt-8 mb-4">Code Examples</h3>
          <Tabs defaultValue="r">
            <TabsList className="mb-4">
              <TabsTrigger value="r">R</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>

            <TabsContent value="r" className="relative">
              <div className="relative">
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{getRCode()}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(getRCode(), null, false, 'r')}
                  className="absolute top-2 right-2"
                >
                  {copiedCodeExample === 'r' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="python" className="relative">
              <div className="relative">
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{getPythonCode()}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(getPythonCode(), null, false, 'python')}
                  className="absolute top-2 right-2"
                >
                  {copiedCodeExample === 'python' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {showCopiedAll && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              All colors copied to clipboard!
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaletteDetailDialog;