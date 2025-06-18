## overview

t3 hackathon AI thingy. Fair warning, ive never worked with llms so this is all a crapshoot if you want to read the code.
Shoutout to [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte). I'm never learning design as long as they're around.
this is intended to be deployed locally, deploy publicly at own risk

## quick start

```bash
git clone https://github.com/krugcode/p33chat
cd p33chat
cp .env.example .env
docker-compose up -d --build
docker-compose logs -f web
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
