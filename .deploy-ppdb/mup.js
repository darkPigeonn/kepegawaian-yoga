module.exports = {
  servers: {
    one: {
      host: "188.166.229.238",
      username: "root",
      pem: "~/.ssh/id_rsa",
      opts: {
        port: 2200,
      },
    },
  },
  app: {
    name: "yogaPpdb",
    path: "../",
    volumes: {
      "/home/yogaPpdb/uploads": "/uploads",
    },
    servers: {
      one: {},
    },
    buildOptions: {
      serverOnly: true,
      debug: false,
      cleanAfterBuild: true,
    },
    env: {
      ROOT_URL: "https://opsppdb.yohannesgabriel.org",
      MONGO_URL:
        "mongodb+srv://oB8mL3oG0tD8dY2o:fV9cL7yH7fI9gK9bM0nC1eA0mM4uF6bV@cluster0.abb1b.mongodb.net/operational?retryWrites=true&w=majority",
      MONGO_OPLOG_URL:
        "mongodb+srv://pH0nF1iG1uM0lJ3u:uB8mH9iZ2zV3aM0lQ9cY7aC5rD6gL4jL@cluster0.abb1b.mongodb.net/local?ssl=true&retryWrites=true&authSource=admin&w=majority&replicaSet=atlas-edzucr-shard-0",
    },
    docker: {
      image: "zodern/meteor:0.6.1-root",
      prepareBundle: true,
      stopAppDuringPrepareBundle: true,
    },
    enableUploadProgressBar: true,
  },
  proxy: {
    domains: "opsppdb.yohannesgabriel.org",
    ssl: {
      letsEncryptEmail: "notnakusnadi@gmail.com",
    },
  },
};
