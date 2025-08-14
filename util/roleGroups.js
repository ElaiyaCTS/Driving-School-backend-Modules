// utils/roleGroups.js
export const ROLE = {
  systemAdmins: ['IT-Admin'], // jwtAuth(ROLE.systemAdmins)

  superUsers: ['Owner', 'IT-Admin'], // jwtAuth(ROLE.superUsers)

  adminLevel: ['Owner', 'Admin', 'IT-Admin'], // jwtAuth(ROLE.adminLevel)

  branchTeam: ['Owner', 'Admin', 'Instructor', 'IT-Admin'], // jwtAuth(ROLE.branchTeam)
    
 learnerLevel: ['Owner', 'Admin', 'Learner', 'IT-Admin'], // jwtAuth(ROLE.learnerLevel)

  everyone: ['Owner', 'Admin', 'Instructor', 'Learner', 'IT-Admin'], // jwtAuth(ROLE.everyone)
};
export default ROLE;
