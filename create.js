const fetch = require('node-fetch');

const API_TOKEN = process.env.CLUBHOUSE_API_TOKEN;

newProj = {
  name: 'test project',
  team_id: 1
}

fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
  method: 'post',
  body: JSON.stringify(newProj),
  headers: { 'Content-Type': 'application/json' },
})
  .then(res => res.json())
  .then(json => console.log(json));
