FROM alpine

RUN useradd -ms /bin/bash smriti_web

USER smriti_web

COPY package.json .
RUN npm install 

COPY tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./
COPY index.html .
COPY src .

ENTRYPOINT npm

CMD ["run", "dev"]

EXPOSE 8080