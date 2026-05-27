library(tidyverse)

palettes_d_paletteer <- paletteer::palettes_d_names %>%
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
  ) %>%
  left_join(
    paletteer::paletteer_packages %>%
      janitor::clean_names() %>%
      select(name, github, cran),
    by = c("package" = "name")
  ) %>%
  select(-id) %>%
  rename(gh = github) %>%
  mutate(
    # Supported in paletteer
    pltr = TRUE
  )

palettes_d_peRsian <- peRsian::persian_palettes |>
  enframe(name = "palette", value = "colors") |>
  mutate(
    package = "peRsian",
    length = colors |> lapply(length),
    type = "qualitative",
    gh = "jan-yegi/peRsian",
    cran = FALSE,
    # Not supported in paletteer
    pltr = FALSE
  )

palettes_d_extra <- rbind(
  palettes_d_peRsian
)

palettes_d <- rbind(
  palettes_d_paletteer,
  palettes_d_extra
)

palettes_d %>%
  jsonlite::write_json("src/data/palettes_d.json")
palettes_d

# TODO: Add these as well
# paletteer::palettes_c_names
# paletteer::palettes_dynamic_names

