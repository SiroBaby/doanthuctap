import { Controller, Post, Req, Res, Body, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { PrismaService } from '../prisma.service';

type ClerkWebhookEvent = {
    data: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email_addresses: Array<{
        id: string;
        email_address: string;
      }>;
      primary_email_address_id: string;
      created_at: number;
    };
    object: string;
    type: string;
  };

@Controller('webhooks')
export class WebhooksController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error('Missing WEBHOOK_SECRET');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing svix headers'
      });
    }

    try {
      const wh = new Webhook(WEBHOOK_SECRET);
      const evt = wh.verify(JSON.stringify(req.body), {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;

      if (evt.type === 'user.created' || evt.type === 'user.updated') {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const primaryEmail = email_addresses.find(
          email => email.id === evt.data.primary_email_address_id
        );

        if (!primaryEmail) {
          return res.status(400).json({
            success: false,
            message: 'No primary email found'
          });
        }

        if (evt.type === 'user.created') {
          await this.prisma.user.create({
            data: {
              id_user: id.toString(),
              user_name: `${first_name || ''} ${last_name || ''}`.trim(),
              email: primaryEmail.email_address,
              password: 'CLERK_AUTH_USER',
              role: 'user',
              create_at: new Date(evt.data.created_at),
            },
          });
        } else {
          await this.prisma.user.update({
            where: { id_user: id.toString() },
            data: {
              user_name: `${first_name || ''} ${last_name || ''}`.trim(),
              email: primaryEmail.email_address,
              update_at: new Date(),
            },
          });
        }
      }

      if (evt.type === 'user.deleted') {
        await this.prisma.user.delete({
          where: { id_user: evt.data.id.toString() },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });

    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(400).json({
        success: false,
        message: 'Error processing webhook',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
}