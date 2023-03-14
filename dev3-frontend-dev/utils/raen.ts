import { readCustomSection } from "wasm-walrus-tools";
import { ContractCodeView } from "near-api-js/lib/providers/provider";
import snake from "to-snake-case";

export const getSchemaFromCodeView = async (code: ContractCodeView) => {
  const wasm = Buffer.from(code.code_base64, "base64");
  const jsonCustomSection = await readCustomSection(wasm, "json");
  if (!jsonCustomSection) {
    throw new Error();
  }

  let startOfJson = Buffer.from(jsonCustomSection.slice(0, 20)).toString(
    "utf8"
  );
  // if link return string
  if (startOfJson.startsWith("https://")) {
    return Buffer.from(jsonCustomSection).toString("utf8");
  }
  // Else is compressed data
  const brotli = await import("brotli-dec-wasm");
  let decompressedData = brotli.brotliDec(jsonCustomSection);

  if (!decompressedData) {
    throw new Error();
  }
  return Buffer.from(decompressedData).toString("utf8");
};

export const getMethodsFromSchema = (schema: any) => {
  if (!schema.definitions) {
    return [];
  }

  const methods = Object.entries(schema.definitions)
    .filter(([_, value]) => {
      return (value as any).hasOwnProperty("contractMethod");
    })
    .map(([key, value]) => {
      // remove args from required if there are no properties
      if (!schema.definitions[key].properties.args.properties) {
        delete schema.definitions[key].properties.args;
        schema.definitions[key].required = schema.definitions[
          key
        ].required.filter((k: string) => k !== "args");
      }

      return {
        key,
        type: (value as any).contractMethod,
        method: snake(key),
        schema: {
          $ref: `#/definitions/${key}`,
          ...schema,
        },
      };
    });

  return methods;
};
