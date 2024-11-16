library(tidyverse)

palettes_d <- paletteer::palettes_d_names %>%
  select(-novelty) %>%
  mutate(
    id = paste0(package, "::", palette)
  ) %>%
  distinct() %>% # There is one duplicate
  rowwise() %>%
  mutate(
    colors = paletteer::paletteer_d(id) %>%
      as.character() %>%
      str_sub(1, 7) %>% # Remove alpha section
      list()
  )

palettes_d %>%
  jsonlite::write_json("src/data/palettes_d.json")
palettes_d

# TODO: Add these as well
# paletteer::palettes_c_names
# paletteer::palettes_dynamic_names

