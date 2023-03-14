import React from "react";
import { Button, Box, Image, Text, Stack, Group } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { Photo } from "tabler-icons-react";

const IMAGE_MIME_TYPE = ["image/png", "image/gif", "image/jpeg"];

interface IProjectImage {
  onUpload: (f: FileWithPath) => void;
  imgUrl?: string;
}

export const ProjectImage: React.FC<IProjectImage> = ({ onUpload, imgUrl }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(
    imgUrl
  );
  const openRef = React.useRef<() => void>(null);

  const handleDrop = async (files: Array<FileWithPath>) => {
    const file = files[0];

    setPreviewUrl(URL.createObjectURL(file));
    onUpload(file);
  };

  const handleChange = () => {
    if (openRef.current) {
      openRef.current();
    }
  };

  return (
    <Stack w="100%">
      {previewUrl && (
        <Stack align="center">
          <Image alt="logo preview" maw={400} src={previewUrl} />
          <Group w="100%" position="right">
            <Button variant="subtle" onClick={handleChange}>
              Change
            </Button>
          </Group>
        </Stack>
      )}

      <Box
        sx={{
          display: previewUrl ? "none" : "flex",
        }}
      >
        <Dropzone
          w="100%"
          openRef={openRef}
          accept={IMAGE_MIME_TYPE}
          onDrop={handleDrop}
          multiple={false}
        >
          <Group
            position="center"
            spacing="xl"
            style={{ minHeight: 220, pointerEvents: "none" }}
          >
            <Photo size={50} />

            <div>
              <Text size="xl" inline>
                Drag image here or click to select from files
              </Text>
              <Text size="sm" color="dimmed" inline mt={7}>
                Image must be of PNG, GIF or JPEG format.
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Box>
    </Stack>
  );
};
