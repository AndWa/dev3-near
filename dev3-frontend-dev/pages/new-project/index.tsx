import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import { PageContainer } from "../../components/layout/PageContainer";
import { ProjectImage } from "../../components/settings/ProjectImage";
import {
  fetchApiKeyControllerCreate,
  fetchFileControllerUploadFile,
  fetchProjectControllerCreate,
  useProjectControllerFindAll,
} from "../../services/api/dev3Components";
import { getDefaultExpires } from "../../utils/api-key";
import { notifications } from "../../utils/notifications";

const NewProject: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<FileWithPath | null>(null);
  const router = useRouter();

  const { refetch: refetchProjects } = useProjectControllerFindAll({});

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      name: "",
      slug: "",
    },
    validate: {
      name: (value) => (value.length > 0 ? null : "Name is required"),
      slug: (value) => (value.length > 0 ? null : "Slug is required"),
    },
  });

  const handleImageUpload = (file: FileWithPath) => {
    setLogoFile(file);
  };

  const handleSubmit = async ({
    name,
    slug,
  }: {
    name: string;
    slug: string;
  }) => {
    try {
      setLoading(true);

      notifications.create({
        title: "Creating a new project",
        message: "Please wait...",
      });

      let logoId;

      if (logoFile) {
        const uploadedFile = await fetchFileControllerUploadFile({
          body: {
            file: logoFile,
          },
        });

        logoId = (uploadedFile as any)._id;
      }

      const project = await fetchProjectControllerCreate({
        body: {
          name,
          slug,
          logo_id: logoId,
        } as any,
      });

      await fetchApiKeyControllerCreate({
        body: {
          project_id: (project as any)._id,
          expires: getDefaultExpires(),
        },
      });

      notifications.success({
        title: "Project created!",
        message:
          "Your project has been created. You can now start adding contracts to it.",
      });

      await refetchProjects();
      router.push("/");
    } catch (error) {
      notifications.error({
        title: "Error creating project",
        message:
          "There was an error creating your project. Please try again later.",
      });

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Create new project">
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <TextInput
          disabled={loading}
          withAsterisk
          label="Project Name"
          placeholder="Enter project name"
          {...form.getInputProps("name")}
        />

        <TextInput
          disabled={loading}
          mt="sm"
          withAsterisk
          label="Project Slug"
          placeholder="Enter project slug"
          {...form.getInputProps("slug")}
        />

        <Stack mt="md" spacing={4}>
          <Text fz="sm">Logo Image</Text>
          <ProjectImage onUpload={handleImageUpload} />
        </Stack>

        <Group position="right" mt="md">
          <Button disabled={loading} type="submit">
            Create project
          </Button>
        </Group>
      </form>
    </PageContainer>
  );
};

export default NewProject;
