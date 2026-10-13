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

# Colorblind safety: minimal color difference (CIEDE2000) between any two
# colors under simulated deuteranopia, protanopia and tritanopia, stored as an
# integer (delta E * 10). The frontend implements the same check
# (src/colorblindCheck.ts) to show detailed scores.
palettes_d <- palettes_d %>%
  rowwise() %>%
  mutate(
    cvd = if (length(colors) < 2) NA_integer_ else {
      check <- colorblindcheck::palette_check(colors)
      as.integer(round(min(check$min_dist[check$name != "normal"]) * 10))
    }
  ) %>%
  ungroup()

# Write palettes in a compact format to keep the website's download small
# (see src/data/loadPalettes.ts for decoding):
# {
#   "<package>": {
#     "gh": "<github repo>" | null, "cran": 0 | 1, "pltr": 0 | 1,
#     "palettes": [
#       ["<palette>", "<type: q / d / s>", "<colors as one hex string>", <cvd>]
#     ]
#   }
# }
palettes_compact <- lapply(split(palettes_d, palettes_d$package), function(pkg) {
  list(
    gh = pkg$gh[[1]],
    cran = as.integer(pkg$cran[[1]]),
    pltr = as.integer(pkg$pltr[[1]]),
    palettes = lapply(seq_len(nrow(pkg)), function(i) {
      list(
        pkg$palette[[i]],
        substr(pkg$type[[i]], 1, 1),
        paste(substring(pkg$colors[[i]], 2), collapse = ""),
        pkg$cvd[[i]]
      )
    })
  )
})

palettes_compact %>%
  jsonlite::write_json("src/data/palettes.json", auto_unbox = TRUE, na = "null")
palettes_d

# TODO: Add these as well
# paletteer::palettes_c_names
# paletteer::palettes_dynamic_names

