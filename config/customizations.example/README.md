# Trestleboard Customizations

Copy of these examples is created by `npm run customize -- init` in
`config/customizations/` (which is gitignored). Customizations are only used
when `customizations.enabled: true` in `trestleboard.yaml`.

```
config/customizations/
├── customizations.yaml     # registers formats and data files
├── personas/               # add / overload / override personas
├── templates/              # new document formats (Handlebars)
└── schemas/                # new data files (JSON Schema)
```

## Personas

Every persona starts with a YAML front matter `persona:` block. Files in
`personas/` are loaded automatically, except files starting with `_` (the
shipped examples) - rename an example to activate it.

| `persona.mode` | Meaning |
|----------------|---------|
| `add` (default) | A new persona. Its `id` must not already exist. |
| `override` | Replaces the out-of-box persona with the same `id`. |
| `overload` | Extends the out-of-box persona. Each `## Section` in the overload replaces the base section of the same name, or is appended if the base has none. Use `persona.sections` to `append` or `prepend` instead of replacing. |

Overload content must live under `##` headings.

## Formats and data files

`customizations.yaml` registers new document formats (a Handlebars template,
rendered with `tb-render`) and data files (a JSON schema, checked with
`tb-validate --schema <id>`). Paths are relative to the customizations folder.

Run `npm run lint` to check that customizations are consistent with the rest of Trestleboard.
