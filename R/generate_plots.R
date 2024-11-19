library(tidyverse)
library(janitor)

theme_set(
  theme_void() +
    theme(legend.position = "none")
  # theme_minimal() +
  # # Hide Axes
  # theme(
  #   axis.title = element_blank(),
  #   axis.text = element_blank()
  # )
)

placeholder_colors <- c("#F00000", "#FF0000", "#00F000", "#00FF00", "#0000F0")
scale_placeholder_color <- scale_color_manual(values = placeholder_colors)
scale_placeholder_fill <- scale_fill_manual(values = placeholder_colors)

export_plot <- function(plot) {
  plot_name <- rlang::enexpr(plot)
  ggsave(plot=plot, filename = paste0("R/plots/", plot_name, ".svg"))
}

# Line Plot
# Data: https://ourworldindata.org/grapher/co-emissions-per-capita?tab=chart&time=1923..latest&country=USA~GBR~CHN~ZAF~PAN
line_plot <- read_csv("R/data/co-emissions-per-capita.csv") %>%
  clean_names() %>%
  ggplot(aes(x = year, y = annual_co2_emissions_per_capita, color = entity)) +
  geom_line() +
  scale_placeholder_color
line_plot
export_plot(line_plot)

# Area Plot
# Data: https://ourworldindata.org/grapher/annual-co-emissions-by-region?time=1923..latest&facet=none
annual_emissions_by_region <- read_csv("R/data/annual-co-emissions-by-region.csv") %>%
  clean_names()
top_regions <- annual_emissions_by_region %>%
  filter(year == max(year)) %>%
  arrange(desc(annual_co2_emissions_4)) %>%
  head(5) %>%
  pull(entity)
area_plot <- annual_emissions_by_region %>%
  filter(entity %in% top_regions) %>%
  ggplot(aes(x = year, y = annual_co2_emissions_4, fill = entity)) +
  geom_area() +
  scale_placeholder_fill
area_plot
export_plot(area_plot)

# Choropleth
# Data: https://ourworldindata.org/grapher/share-electricity-renewables?time=latest
# Semantically better suited for sth continuous, but should be fine just visually
share_electricity_renewables <- read_csv("R/data/share-electricity-renewables.csv") %>%
  clean_names() %>%
  filter(!is.na(renewables_percent_electricity)) %>%
  mutate(entity = case_when(
    entity == "Congo" ~ "Republic of Congo",
    entity == "Cote d'Ivoire" ~ "Ivory Coast",
    entity == "Czechia" ~ "Czech Republic",
    entity == "Democratic Republic of Congo" ~ "Democratic Republic of the Congo",
    entity == "East Timor" ~ "Timor-Leste",
    entity == "Eswatini" ~ "Swaziland",
    entity == "Saint Kitts and Nevis" ~ "Saint Kitts",
    entity == "Saint Vincent and the Grenadines" ~ "Saint Vincent",
    entity == "Trinidad and Tobago" ~ "Trinidad",
    entity == "United Kingdom" ~ "UK",
    entity == "United States" ~ "USA",
    TRUE ~ entity  # Keep all other names as-is
  ))

map_plot <- map_data("world") %>%
  inner_join(share_electricity_renewables, by = c("region" = "entity")) %>%
  mutate(
    renewables_cat = cut(
      renewables_percent_electricity,
      breaks = c(-1, 20, 40, 60, 80, 100)
    )
  ) %>%
  ggplot(aes(x = long, y = lat, group = group, fill = renewables_cat)) +
    geom_polygon() +
    coord_sf(xlim = c(-30, 50), ylim = c(-30, 45), expand = FALSE) +
    scale_placeholder_fill
map_plot
export_plot(map_plot)

# Bar Plot
# Data: https://ourworldindata.org/grapher/number-electoral-democracies-age
bar_plot <- read_csv("R/data/number-electoral-democracies-age.csv") %>%
  clean_names() %>%
  select(ends_with("_years")) %>%
  pivot_longer(everything()) %>%
  ggplot(aes(x = value, y = name, fill = name)) +
  geom_col() +
  scale_placeholder_fill
bar_plot
export_plot(bar_plot)

# Scatter / Bubble Plot
# Data: https://ourworldindata.org/grapher/child-mortality-vs-population-growth
child_mortality_vs_population_growth <- read_csv("R/data/child-mortality-vs-population-growth.csv") %>%
  clean_names()

scatter_plot <- child_mortality_vs_population_growth %>%
  # Sorry oceania, only 5 colors possible for now :'(
  filter(world_regions_according_to_owid != "Oceania") %>%
  ggplot(aes(
    x = child_mortality_rate_sex_all_variant_estimates,
    y = natural_population_growth_rate_sex_all_age_all_variant_estimates,
    size = population_historical,
    color = world_regions_according_to_owid
  )) +
  geom_point() +
  scale_size_continuous(range = c(1, 10)) +
  scale_placeholder_color
scatter_plot
export_plot(scatter_plot)

# Boxplots
# Data: https://ourworldindata.org/grapher/share-electricity-solar
share_electricity_solar <- read_csv("R/data/share-electricity-solar.csv") %>%
  clean_names() %>%
  mutate(
    region = countrycode::countrycode(entity, "country.name", "continent")
  )

box_plot <- share_electricity_solar %>%
  filter(!is.na(region)) %>%
  ggplot(aes(x = region, y = solar_percent_electricity, fill = region)) +
  geom_boxplot() +
  # Transform Y-Scale because Namibia is too good at 37%!!
  coord_trans(y = "sqrt") +
  scale_placeholder_fill
box_plot
export_plot(box_plot)
