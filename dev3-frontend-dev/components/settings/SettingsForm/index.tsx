import { Button, Group, TextInput } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import React, { useState } from "react";

import {
  fetchFileControllerUpdateFile,
  fetchFileControllerUploadFile,
  fetchProjectControllerUpdate,
  useProjectControllerFindAll,
} from "../../../services/api/dev3Components";
import { Project } from "../../../services/api/dev3Schemas";
import { getLogoUrl } from "../../../utils/logo";
import { notifications } from "../../../utils/notifications";
import { ProjectImage } from "../ProjectImage";

interface ISettingFormProps {
  project: Project;
}

export const SettingsForm: React.FC<ISettingFormProps> = ({ project }) => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<FileWithPath>();

  const { refetch: refetchProjects } = useProjectControllerFindAll({});

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      name: project.name ?? "",
    },
    validate: {
      name: (value) => (value.length > 0 ? null : "Name is required"),
    },
  });

  const handleImageUpload = async (file: FileWithPath) => {
    setLogoFile(file);
  };

  const handleSubmit = async ({ name }: { name: string }) => {
    try {
      setLoading(true);

      notifications.create({
        title: "Updating project",
        message: "Please wait...",
      });

      const id = (project as any)._id as string;
      let logoId = (project?.logo as any)?._id;

      if (logoFile && logoId) {
        await fetchFileControllerUpdateFile({
          body: {
            file: logoFile,
          },
          pathParams: {
            id: logoId,
          },
        });
      } else if (logoFile) {
        const uploadedFile = await fetchFileControllerUploadFile({
          body: {
            file: logoFile,
          },
        });

        logoId = (uploadedFile as any)._id;
      }

      await fetchProjectControllerUpdate({
        pathParams: {
          id: id as string,
        },
        body: {
          name,
          logo_id: logoId,
        },
      });

      notifications.success({
        title: "Project updated!",
        message: "Your project has been updated.",
      });

      refetchProjects();
    } catch (error) {
      notifications.error({
        title: "Error updating project",
        message:
          "There was an error updating your project. Please try again later.",
      });

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <TextInput
          mt="md"
          disabled={loading}
          withAsterisk
          label="Project Name"
          placeholder="Enter project name"
          {...form.getInputProps("name")}
        />

        <Group position="right" mt="md">
          <Button disabled={loading} type="submit">
            Update project
          </Button>
        </Group>
      </form>

      <ProjectImage
        key={project?.logo?.key}
        imgUrl={project?.logo && getLogoUrl(project.logo)}
        onUpload={handleImageUpload}
      />
    </>
  );
};
