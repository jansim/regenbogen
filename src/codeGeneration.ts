export const generateCodeR = (palette) => {
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

export const generateCodePython = (palette) => `# Define the color palette
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
