## overview

t3 hackathon AI thingy
Shoutout to [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte). I'm never learning design as long as they're around.
Live demo: https://p33.krugg.dev
(another shoutout to [coolify](https://github.com/coollabsio/coolify). I never need to learn devops either.)

## quick start

Set the following in the .env (required to get mails running)

```
APP_URL=http://localhost:5173
SENDER_EMAIL=noreply@yourdomain.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
BREVO_LOGIN=your_brevo_login_here
BREVO_PASSWORD=
```

(its brevo or bust, don't even try that sendgrid shit around here)

```bash
git clone https://github.com/yourusername/p33chat
cd p33chat
docker-compose up -d
```

## clean slate

```bash
docker-compose down
docker-compose up -d --build
docker-compose logs -f pocketbase
```

## logs

```bash
docker-compose logs -f web
```

Web: http://localhost:5173
PocketBase admin: http://localhost:8090/\_/

For simplicity, SU is defaulted to following creds. Define them in the .env to override
Email: `admin@p33chat.com`
Password: `p33chatisvercool`

## file mgmt and s3

I made this optional, but there are env vars for deploying with s3.
You can also go into the pocketbase ui > settings > file storage > use s3 if you so wish

## generating pocketbase types

im using the pocketbase-typegen package, you'll need to set the following vars:
