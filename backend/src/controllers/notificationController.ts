import { type Request, type Response } from 'express';
import * as notificationService from '../services/notificationServices.js';
import { createNotificationSchema } from '../schemas/notificationSchema.js';

export const createNotification = async (req: Request, res: Response) => {
  const result = createNotificationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(result.error.format());
  }

  const notification = await notificationService.createNotification(result.data);
  res.status(201).json(notification);
};

export const getNotifications = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const notifications = await notificationService.getByUserId(userId);
  res.json(notifications);
};

export const readNotifById =  async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const notification = await notificationService.readNotifById(id);
  res.json(notification);
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de notificação inválido" });
    }

    await notificationService.deleteNotification(id);

    return res.status(204).send();
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao eliminar a notificação" });
  }
};