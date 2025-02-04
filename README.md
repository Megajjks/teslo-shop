<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Teslo API

## Ejecutar en desarrollo

1. Clonar el repositorio
2. Ejecutar

```
yarn install
```

3. Tener Nest CLI instalado

```
npm i -g @nestjs/cli
```

4. Levantar la base de datos

```
docker-compose up -d
```

5. Clonar archivo **.env.template** y renombrarlo a **.env**

6. Llenar las variables de entorno definidas en el **.env**

7. Correr la aplicación en local

```
yarn start:dev
```

8. Reconstruir la base de datos con la semilla

```
http://localhost:3000/api/v2/seed
```

## Production Build

1. Clonar proyecto
   `yarn install`
2. Clonar el archivo `.env.template` y renombrarlo a `.env`
3. Cambiar las variables de entorno
4. Levantar la base de datos

```
docker compose up -d
```

5. Ejecutar SEED

```
http://localhost:3030/api/seed
```

6. Levantar: `yarn start:dev`

## Stack usado

- Postgres
- Nestjs
