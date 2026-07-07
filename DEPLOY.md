# Deploy em Producao

## Importante sobre Render

Render nao tem runtime nativo para .NET/C#. Sem Docker, a API ASP.NET Core nao sobe direto no Render como um Web Service comum.

Se voce nao quer Docker, use outro host para a API .NET, por exemplo:

- Azure App Service
- MonsterASP.NET
- Somee
- VPS com .NET 8 instalado

O frontend pode continuar no Vercel normalmente.

## 1. API sem Docker

1. Suba o projeto para o GitHub.
2. Crie a aplicacao no host .NET escolhido.
3. Configure o projeto/pasta da API como `AlmoxarifadoSenai.Api`.
4. Use .NET 8.
5. Configure as variaveis de ambiente:

```txt
ASPNETCORE_ENVIRONMENT=Production
Jwt__Key=uma-chave-forte-com-pelo-menos-32-caracteres
Jwt__Issuer=AlmoxarifadoAPI
Jwt__Audience=AlmoxarifadoUsuarios
Jwt__DurationInMinutes=60
Firebase__ProjectId=almoxarifadosenai-d7cca
Cors__AllowedOrigins__0=https://SEU-FRONT.vercel.app
FIREBASE_CREDENTIALS_JSON=conteudo-completo-do-json-da-service-account
```

Depois do deploy, teste:

```txt
https://SUA-API/health
https://SUA-API/api/Dashboard/health
```

## 2. Frontend no Vercel

1. No Vercel, importe o mesmo repositorio.
2. Configure **Root Directory** como `FrontEnd`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Configure a variavel:

```txt
VITE_API_URL=https://SUA-API/api
```

7. Faca o deploy.
8. Volte no host da API e ajuste `Cors__AllowedOrigins__0` com a URL final do Vercel.
9. Redeploy da API.

## 3. Observacoes importantes

- Nao use `firebase-credentials.json` commitado em producao. Use `FIREBASE_CREDENTIALS_JSON` no painel de variaveis do host.
- O login depende da API e do Firestore. Cadastre usuarios reais na colecao `usuarios`.
- A matricula deve bater com o documento/usuario e `dataNascimento` deve estar no formato `DDMMAAAA`.
- A API precisa aceitar a porta definida pelo host. Em Azure App Service isso ja e tratado pela plataforma.
