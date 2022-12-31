export const fetchRoleQuery = `
    SELECT ROLE
    FROM USER
    WHERE EMAIL = ?
`;