export const generateCodeR = (palette, variant: "paletteer" | "manual") => {
  let code = "";
  if (variant === "paletteer") {
    code += `# Install paletteer
install.packages("paletteer")

# Use directly
paletteer::paletteer_d("${palette.id}")

# Use with ggplot2
ggplot(mpg, aes(class)) +
  geom_bar(aes(fill = class)) +
  paletteer::scale_color_paletteer_d("${palette.id}")
`;
  } else if (variant === "manual") {
    // Load original package
    if (palette.cran) {
      code += `# Install the original package
install.packages("${palette.package}")
`;
    } else if (palette.gh) {
      code += `# Install from github
remotes::install_github("${palette.gh}")
`;
    }

    if (palette.gh || palette.cran) {
      code += `library(${palette.package})

# ... code depends on package ...
`;
    }

    // Manually definition
    code += `
# Manually define color palette
colors <- c(
  "${palette.colors.map((c) => c).join('",\n  "')}"
)
`;
  }

  code += "\n# Credit the original palette"
  if (palette.cran) {
    code += `citation(package="${palette.package}")`;
  } else if (palette.gh) {
    code += "\n# Source: https://github.com/" + palette.gh;
  }

  code += "\n";

  return code;
};

export const generateCodePython = (palette) => `# Define the color palette
colors = ${JSON.stringify(palette.colors, null, 2)}

# Use with Matplotlib
import matplotlib.pyplot as plt
plt.bar(x, height, color=colors)

# Use with Seaborn
import seaborn as sns
sns.barplot(data=df, x='category', y='value', palette=colors)

# Use for all plots
sns.set_palette(colors)

# Credit the original palette
# Source: https://github.com/${palette.gh}

`;