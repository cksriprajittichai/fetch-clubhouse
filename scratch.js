const fetch = require('node-fetch');

const API_TOKEN = process.env.CLUBHOUSE_API_TOKEN;

/* Fetch all projects. Returns a promise */
const fetchProjects = () => {
  return fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
    headers: {'Content-Type': 'application/json'}
  });
};

/* Fetch a project with ID. Returns a promise */
const fetchProject = (projectId) => {
  return fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}?token=${API_TOKEN}`, {
    headers: {'Content-Type': 'application/json'}
  });
};

/* Fetch all stories in a project. Returns a promise */
const fetchProjectStories = (projectId) => {
  return fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}/stories?token=${API_TOKEN}`, {
    headers: {'Content-Type': 'application/json'}
  });
};

/* Fetch all members in the organization. Returns a promise */
const fetchMembers = () => {
  return fetch(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
    headers: {'Content-Type': 'application/json'}
  });
};

// Fetch all members
fetchMembers()
  .then(rawRes => {
    return rawRes.json();
  })
  .then(res => {
    // res is an array of member objects
    // console.log(res);

    // Create a map of member ID -> member object
    memberMap = {};
    res.map((member) => {
      memberMap[member.id] = member;
    });
    // console.log(memberMap);

    // Fetch projects
    fetchProjects()
      .then(rawRes => {
        return rawRes.json();
      })
      .then(res => {
        // res is an array of project objects
        // console.log(res);

        // Look at the first project in the array
        firstProj = res[0];
        console.log(`Inspecting project ${firstProj.id}`);
        // // console.log(firstProj);
        console.log(`\tProject ID: ${firstProj.id}`);
        console.log(`\tDescription: ${firstProj.description}`);
        console.log(`\t# of stories in project: ${firstProj.stats.num_stories}`);
        console.log(`\t# of story points in project: ${firstProj.stats.num_points}`);

        // Look at the stories in the firstProj
        fetchProjectStories(firstProj.id)
          .then(rawRes => {
            return rawRes.json();
          })
          .then(res => {
            // res is an array of story objects
            // console.log(res);

            console.log(`Inspecting the stories in project ${firstProj.id}`);
            res.map((story) => {
              membersAssignedToStory = story.owner_ids.map(id => memberMap[id].profile.name);
              // console.log(membersAssignedToStory);

              console.log(`\tInspecting story ${story.id}`);
              console.log(`\t\tStory ID: ${story.id}`);
              console.log(`\t\tName: ${story.name}`);
              console.log(`\t\tCompleted: ${story.completed}`);
              console.log(`\t\tEstimate (# points): ${story.estimate}`);
              console.log(`\t\tDeadline: ${story.deadline}`);
              console.log(`\t\tAssigned to: ${membersAssignedToStory}`);
            });
          });
      });
  });
