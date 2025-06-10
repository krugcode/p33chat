## overview

t3 hackathon AI thingy
Shoutout to [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte). I'm never learning design as long as they're around.

## quick start

```bash
git clone https://github.com/yourusername/p33chat
cd p33chat
docker-compose up -d
```

## clean slate

everyone deserves a second chance

```bash
docker-compose down
sudo rm -rf db/pb_data
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
