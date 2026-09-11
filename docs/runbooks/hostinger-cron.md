# Cron da Hostinger Business

Configure um Cron Job no hPanel para executar a cada 5 minutos, em UTC+0:

```bash
curl -fsS -X POST \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  https://jonaselivaldohair.com.br/internal/cron/process
```

O `CRON_SECRET` deve ficar somente nas variáveis de ambiente do hPanel. O endpoint limita cada execução a 50 jobs e devolve apenas contadores.
