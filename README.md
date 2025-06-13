## overview

t3 hackathon AI thingy
Shoutout to [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte). I'm never learning design as long as they're around.
this is intended to be deployed locally, deploy publicly at own risk

## quick start

Set the following in the .env (required to get mails running)

```
APP_URL=http://localhost:5173
SENDER_EMAIL=noreply@yourdomain.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_LOGIN=your_brevo_login_here
SMTP_PASSWORD=
```

```bash
git clone https://github.com/yourusername/p33chat
cd p33chat
docker-compose up -d --build
docker-compose logs -f pocketbase
```

## clean slate

```bash
docker-compose down
docker-compose up -d --build
```

## logs

```bash
#frontend
docker-compose logs -f web
#database
docker-compose logs -f pocketbase
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
