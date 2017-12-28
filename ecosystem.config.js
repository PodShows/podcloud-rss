const appendEnvIfNotProduction = (name) => {
  let suffix = "-development"

  if(typeof process.env === "object") {
    if(typeof process.env.NODE_ENV === "string") {
      if(process.env.NODE_ENV.trim() !== "") {
        suffix = ("-"+process.env.NODE_ENV.trim().toLowerCase()).replace("-production", "")
      }
    }
  }

  return name+suffix;
}

module.exports = {
    "apps": [
        {
            "name": appendEnvIfNotProduction("rss"),
            "script": "server.js",
            "instances": 3,
            "env_preprod": {
                "NODE_ENV": "preprod"
            },
            "env_production": {
                "NODE_ENV": "production"
            }
        }
    ],
    "deploy": {
        "production" : {
          "user": "podcloud",
          "host": "eve.podradio.fr",
          "ref": "origin/master",
          "repo": "git@github.com:PodShows/podcloud-rss.git",
          "path": "/home/podcloud/production/rss",
          "pre-deploy-local": "ssh-keyscan eve.podradio.fr >> ~/.ssh/known_hosts",
          "post-deploy": "npm install && NODE_ENV=production pm2 startOrReload ecosystem.config.js --env production",
          "env": {
            "NODE_ENV": "production"
          }
        },
        "preprod" : {
          "user": "podcloud",
          "host": "eve.podradio.fr",
          "ref": "origin/develop",
          "repo": "git@github.com:PodShows/podcloud-rss.git",
          "path": "/home/podcloud/preprod/rss",
          "pre-deploy-local": "ssh-keyscan eve.podradio.fr >> ~/.ssh/known_hosts",
          "post-deploy": "npm install && NODE_ENV=preprod pm2 startOrReload ecosystem.config.js --env preprod",
          "env": {
            "NODE_ENV": "preprod"
          }
        }
    }
};
