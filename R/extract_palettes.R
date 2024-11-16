library(tidyverse)

palettes_d <- paletteer::palettes_d_names %>%
  head() %>%
  select(-novelty) %>%
  mutate(
    id = paste0(package, "::", palette)
  ) %>%
  rowwise() %>%
  mutate(
    colors = paletteer::paletteer_d(id) %>%
      as.character() %>%
      list()
  )
palettes_d %>%
  jsonlite::write_json("src/data/palettes_d.json")


paletteer_d

# TODO: Add these as well
# paletteer::palettes_c_names
# paletteer::palettes_dynamic_names

