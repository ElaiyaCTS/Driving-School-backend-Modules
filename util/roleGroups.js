// utils/roleGroups.js
export const ROLE = {
  systemAdmins: ['IT-Admin'], 

  superUsers: ['Owner', 'IT-Admin'], 

  adminLevel: ['Owner', 'Admin', 'IT-Admin'], 

  branchTeam: ['Owner', 'Admin', 'Instructor', 'IT-Admin'], 

  everyone: ['Owner', 'Admin', 'Instructor', 'Learner', 'IT-Admin'], 
};
export default ROLE;
