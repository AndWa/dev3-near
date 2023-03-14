import { File } from "../services/api/dev3Schemas";

// Logo urls are not changed when the asset is patched,
// so the updatedAt is added as an auxiliary query param to bust the browser image cache
export function getLogoUrl(logo: File) {
  if (!logo) {
    return;
  }

  return `${logo.url}?u=${logo.updatedAt}`;
}

export function getLogoPlaceholder(projectName: string) {
  return projectName
    .split(" ")
    .map((v) => v[0].toUpperCase())
    .splice(0, 2)
    .join("");
}
