import { Group } from "@mantine/core";
import { openModal } from "@mantine/modals";
import {
  TelegramIcon,
  TelegramShareButton,
  ViberIcon,
  ViberShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "next-share";

export interface ShareModalProps {
  title: string;
  url: string;
}

const showShareModal = ({ title, url }: ShareModalProps) => {
  openModal({
    title,
    children: (
      <Group>
        <TelegramShareButton url={url} title={title}>
          <TelegramIcon size={32} round={false} borderRadius={6} />
        </TelegramShareButton>
        <ViberShareButton url={url} title={title}>
          <ViberIcon size={32} round={false} borderRadius={6} />
        </ViberShareButton>
        <WhatsappShareButton url={url} title={title} separator=":: ">
          <WhatsappIcon size={32} round={false} borderRadius={6} />
        </WhatsappShareButton>
      </Group>
    ),
  });
};

export default showShareModal;
