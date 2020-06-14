const fetch = require('node-fetch');

const API_TOKEN = process.env.CLUBHOUSE_API_TOKEN;

/* Fetch all projects. Returns a promise */
const fetchProjectsAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

/* Fetch a project with ID. Returns a promise */
const fetchProjectAsync = async (projectId) => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

/* Fetch all stories in a project. Returns a promise */
const fetchProjectStoriesAsync = async (projectId) => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}/stories?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

/* Fetch all stories in all projects. Returns a promise */
const fetchStoriesAsync = async () => {
  return await fetchProjectsAsync()
    .then(projects => {
      return Promise.all(projects.map(project => fetchProjectStoriesAsync(project.id)));
    })
    .then(allProjectsStories => {
      // Remove projects that have no stories
      // Flatten the array to an array of story objects
      return allProjectsStories
        .filter(projectStories => projectStories.length > 0)
        .flat();
    });
}

/* Fetch all members in the organization. Returns a promise */
const fetchMembersAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

/* Fetch all members and create a promise of a map of member ID -> member 
 * object.
 * 
 * Returns a promise
 */
const createMemberMapAsync = async () => {
  const memberMap = {};
  await fetchMembersAsync()
    .then(res => {
      res.map((member) => memberMap[member.id] = member);
    });
  return memberMap;
};

/* Use everything else to create a map of member name -> enhanced member object,
 * where the enhanced member object has an additional field called 'stories',
 * which is an array of the story objects that the member is assigned to.
 *
 * Returns a promise
 */
const createEnhancedMemberMapAsync = async () => {
  let enhancedMemberMap = {};
  // Init map as map of member ID -> member object
  await createMemberMapAsync()
    .then(memberMap => enhancedMemberMap = memberMap);

  // Add 'stories' field (array) to member object
  for (const [_, member] of Object.entries(enhancedMemberMap)) {
    member.stories = [];
  }
  // Add story objects to member object's 'stories' field
  await fetchStoriesAsync()
    .then(stories => {
      stories.map(story => {
        story.owner_ids.map(memberId => enhancedMemberMap[memberId].stories.push(story))
      })
    });

  return enhancedMemberMap;
};

const fetchMemberInfoAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/member?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

// Inspect map of member ID -> enhanced member object
createEnhancedMemberMapAsync()
  .then(memberStoriesMap => {
    for (const [memberId, member] of Object.entries(memberStoriesMap)) {
      console.log(member.profile.name);
      console.log(`\tMember ID: ${memberId}`);
      console.log(`\t${member.stories.length} stories`);

      member.stories.map(story => {
        console.log(story);
        // console.log(`\t\tStory ID: ${story.id}`);
        // console.log(`\t\t\tName: ${story.name}`);
        // console.log(`\t\t\tCompleted: ${story.completed}`);
        // console.log(`\t\t\tEstimate (# points): ${story.estimate}`);
        // console.log(`\t\t\tDeadline: ${story.deadline}`);
      })
    }
  });
