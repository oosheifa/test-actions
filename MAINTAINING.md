# ...

## BUILD

```bash
npm install
npm run lint
npm run validate
npm run tsc:watch
npm run start:fast
npm run start:fast -- -vvvv

DEBUG='tmpl:*' npm run start:fast -- -vvvv
```

```bash
yarn install
yarn run lint
yarn run validate
yarn run tsc:watch
yarn run start:fast
yarn run start:fast -- -vvvv
```

Updating dependencies:

```bash
npm update
yarn upgrade

npm install -g npm-check-updates
npm-check-updates -x '@types/node'
npm-check-updates -x '@types/node' -u
```

## other

```bash
npm link
npm unlink

yarn link
yarn unlink
```
