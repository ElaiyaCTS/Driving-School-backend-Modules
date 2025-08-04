// utils/roleGroups.js

export const ROLE_GROUPS = {
    topLevel: [ 'IT-Admin'], 

    Owner: ['Owner', 'IT-Admin'], 

    ownerOrAdmin: ['Owner', 'Admin', 'IT-Admin'], // ✅ Good
    
    branchStaff: ['Owner','Admin', 'Instructor', 'IT-Admin'],
    
    allUsers: ['Owner', 'Admin', 'Instructor', 'Learner', 'IT-Admin'],

};
