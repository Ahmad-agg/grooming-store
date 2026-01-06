import { Router } from 'express';
import { pool } from '../db/db.js';

export const contact = Router();


contact.get('/api/contact', async (_req, res, next) => {
  try {
    const data = {
      hero: {
        title: 'Get in Touch',
        subtitle:
          "Have questions about our products or need assistance? We're here to help you find the perfect grooming solution.",
      },
      channels: [
        {
          id: 'email',
          title: 'Email Us',
          items: [
            { label: 'support@groomingco.com', href: 'mailto:support@groomingco.com' },
            { label: 'sales@groomingco.com',   href: 'mailto:sales@groomingco.com' },
          ],
          cta: { label: 'Contact', href: 'mailto:support@groomingco.com' },
        },
        {
          id: 'phone',
          title: 'Call Us',
          items: [
            { label: '+1 (555) 123-4567', href: 'tel:+15551234567' },
            { label: '+972-3-123-4567',   href: 'tel:+97231234567' },
          ],
          cta: { label: 'Contact', href: 'tel:+15551234567' },
        },
        {
          id: 'whatsapp',
          title: 'WhatsApp',
          items: [{ label: '+972 50-123-4567', href: 'https://wa.me/972501234567' }],
          cta: { label: 'Contact', href: 'https://wa.me/972501234567' },
        },
        {
          id: 'visit',
          title: 'Visit Us',
          items: [
            { label: '123 Grooming Street' },
            { label: 'Tel Aviv, Israel 12345' },
          ],
          cta: { label: 'Contact', href: 'https://maps.google.com/?q=Tel+Aviv+Israel' },
        },
        {
          id: 'hours',
          title: 'Business Hours',
          items: [
            { label: 'Mon–Fri: 9:00 AM – 6:00 PM' },
            { label: 'Sat–Sun: 10:00 AM – 4:00 PM' },
          ],
        },
      ],
      faqs: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy for all unused products in original packaging.',
        },
        {
          q: 'How can I track my order?',
          a: 'You’ll receive a tracking number via email once your order ships. Use it on our website to track your package.',
        },
        {
          q: 'Do you offer international shipping?',
          a: 'Yes, we ship worldwide. Shipping costs and delivery times vary by location.',
        },
      ],
      quick_actions: [
        { label: 'Email Support', href: 'mailto:support@groomingco.com', icon: 'mail' },
        { label: 'Schedule a Call', href: 'tel:+15551234567', icon: 'phone' },
        { label: 'Live Chat', href: '#', icon: 'chat' }, 
      ],
      location: {
        headline: 'Visit Our Store',
        address: '123 Grooming Street, Tel Aviv, Israel 12345',
        map_url: '#',
      },
    };

    res.json({ data });
  } catch (e) {
    next(e);
  }
});


contact.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message, channel } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        error: { code: 400, message: 'name, email and message are required' },
      });
    }

    const ip = req.ip || null;
    await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message, channel, source_ip)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, subject || null, message, channel || null, ip]
    );

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
