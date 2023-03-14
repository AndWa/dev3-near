import env from "@next/env";
import { defineConfig } from "@openapi-codegen/cli";
import {
  generateReactQueryComponents,
  generateSchemaTypes,
} from "@openapi-codegen/typescript";

const projectDir = process.cwd();
env.loadEnvConfig(projectDir);

export default defineConfig({
  dev3: {
    from: {
      source: "url",
      url: `${process.env.SWAGGER_URL}`,
    },
    outputDir: "services/api",
    to: async (context) => {
      const filenamePrefix = "dev3";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});
