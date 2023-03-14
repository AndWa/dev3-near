import {
  NotificationProps,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";

class Notifications {
  public create(props: Partial<NotificationProps>) {
    const propsWithDefaults = Object.assign(
      {
        id: "loading-notification",
        loading: true,
        title: "Processing",
        message: "Please wait...",
        autoClose: false,
        disallowClose: true,
      },
      props
    );

    showNotification(propsWithDefaults);
  }

  public success(props: Partial<NotificationProps & { id: string }>) {
    const propsWithDefaults = Object.assign(
      {
        id: "loading-notification",
        color: "teal",
        title: "Success!",
        message: "The process was successfull.",
        icon: <Check size={16} />,
        autoClose: 3000,
      },
      props
    );

    updateNotification(propsWithDefaults);
  }

  public error(props: Partial<NotificationProps & { id: string }>) {
    const propsWithDefaults = Object.assign(
      {
        id: "loading-notification",
        color: "red",
        title: "Error",
        message: "There was an error. Please try again later.",
        icon: <X size={16} />,
        autoClose: 3000,
      },
      props
    );

    updateNotification(propsWithDefaults);
  }
}

export const notifications = new Notifications();
